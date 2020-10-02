import { Readable } from "stream";
import * as N3 from "n3";
/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import https from 'https';
import {Observable, Subscriber, TeardownLogic} from 'rxjs';

import {Log} from '../logging';
import {assert} from '../util/assert';

import {Triple} from './triple';
import {Rdfs, SchemaString, UrlNode} from './types';

function unWrap<T>(
  maker: (content: string) => T | null
): (content: string) => T | null {
  return (content: string) => {
    const result = /^<([^<>]+)>$/.exec(content);
    if (result) return maker(result[1]);
    return null;
  };
}

function subject(content: string) {
  return UrlNode.Parse(content);
}

function predicate(content: string) {
  return UrlNode.Parse(content);
}

function object(content: string) {
  const o =
    unWrap(Rdfs.Parse)(content) ||
    unWrap(UrlNode.Parse)(content) ||
    SchemaString.Parse(content);

  assert(o, `Unexpected: ${content}.`);
  return o;
}

const totalRegex = /\s*<([^<>]+)>\s*<([^<>]+)>\s*((?:<[^<>"]+>)|(?:"(?:[^"]|(?:\\"))+(?:[^\"]|\\")"(?:@[a-zA-Z]+)?))\s*\./;
export function toTripleStrings(data: string[]) {
  const linearTriples = data
    .join('')
    .split(totalRegex)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  return linearTriples.reduce((result, _, index, array) => {
    if (index % 3 === 0) {
      result.push(array.slice(index, index + 3));
    }
    return result;
  }, [] as string[][]);
}

export function toTripleStrings2(data: string[]) {
  const toUrl = (input: N3.NamedNode | N3.Literal | N3.BlankNode | N3.Variable, useAngular = false): string => {
    const wrapAngular = (x: string) => useAngular ? `<${x}>` : x;
    switch(input.termType) {
      case "NamedNode":
        return wrapAngular(input.value);
      case "Literal":
        return `"${input.value
          .replace(/"/g, "\\u0022")
          .replace(/\n/g, "\\n")
          .replace(/\r/g, "\\r")
          .replace(/\\/g, "\\\\")}"` + (
            input.language ? `@${input.language}` : ""
          )
      case "BlankNode":
        return wrapAngular(`https://foxthesystem.space/blank_nodes/#${input.value}`);
      default:
        throw new Error(`Don't know how to handle ${input.termType}: ${input.value}`);
    }
  };
  const quads = new N3.Parser().parse(data.join(""));
  return quads.map(quad => [toUrl(quad.subject), toUrl(quad.predicate), toUrl(quad.object, true)])
}

/**
 * Loads schema all Triples from a given Schema file and version.
 */
export function load(url: string): Observable<Triple> {
  return new Observable<Triple>(subscriber => {
    handleUrl(url, subscriber);
  });
}

export function loadFromStream(stream: Readable): Observable<Triple> {
  return new Observable<Triple>(subscriber => {
    handleDataFromUrl(stream, subscriber);
  });
}

function handleUrl(url: string, subscriber: Subscriber<Triple>): TeardownLogic {
  https
    .get(url, response => {
      Log(`Got Response ${response.statusCode}: ${response.statusMessage}.`);
      if (response.statusCode !== 200) {
        const location =
          response.headers['location'] || response.headers['content-location'];

        if (location) {
          Log(`Handling redirect to ${location}...`);
          handleUrl(location, subscriber);
          return;
        }

        subscriber.error(
          `Got Errored Response ${response.statusCode}: ${response.statusMessage}.`
        );
        return;
      }

      handleDataFromUrl(response, subscriber);
    })
    .on('error', e => subscriber.error(e));
}

function handleDataFromUrl(stream: Readable, subscriber: Subscriber<Triple>) {
  const data: string[] = [];

  stream.on('data', (chunkB: Buffer) => {
    const chunk = chunkB.toString('utf-8');
    data.push(chunk);
  });

  stream.on('end', () => {
    try {
      const triples = toTripleStrings2(data);
      for (const triple of process(triples)) {
        subscriber.next(triple);
      }
    } catch (error) {
      Log(`Caught Error on end: ${error}`);
      subscriber.error(error);
    }

    subscriber.complete();
  });

  stream.on('error', error => {
    Log(`Saw error: ${error}`);
    subscriber.error(error);
  });
}

export function* process(triples: string[][]): Iterable<Triple> {
  for (const match of triples) {
    if (match.length !== 3) {
      throw Error(`Unexpected ${match}`);
    }

    if (match[0].includes('file:///')) {
      // Inexplicably, local files end up in the public schema for
      // certain layer overlays.
      continue;
    }

    // Schema.org 3.4 all-layers used to contain a test comment:
    // (Subject:    <http://meta.schema.org/>
    //  Predicate:  <http://www.w3.org/2000/01/rdf-schema#comment>
    //  Object:     "A test comment.")
    // We skip it manually.
    if (/http[s]?:\/\/meta.schema.org\//.test(match[0])) {
      continue;
    }

    if (
      match[1] === 'http://www.w3.org/2002/07/owl#equivalentClass' ||
      match[1] === 'http://www.w3.org/2002/07/owl#equivalentProperty' ||
      match[1] === 'http://purl.org/dc/terms/source' ||
      match[1] === 'http://www.w3.org/2000/01/rdf-schema#label' ||
      match[1] === 'http://www.w3.org/2004/02/skos/core#closeMatch' ||
      match[1] === 'http://www.w3.org/2004/02/skos/core#exactMatch'
    ) {
      // Skip Equivalent Classes & Properties
      continue;
    }

    if (/http[s]?:\/\/schema.org\/isPartOf/.test(match[1])) {
      // When isPartOf is used as a predicate, is a higher-order
      // property describing if a Property or Class is part of a
      // specific schema layer. We don't use that information yet,
      // so discard it.
      continue;
    }

    try {
      yield {
        Subject: subject(match[0]),
        Predicate: predicate(match[1]),
        Object: object(match[2]),
      };
    } catch (parseError) {
      const e = parseError as Error;
      throw new Error(
        `ParseError: ${e.name}: ${e.message} while parsing line ${match}.\nOriginal Stack:\n${e.stack}\nRethrown from:`
      );
    }
  }
}
