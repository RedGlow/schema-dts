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
 *
 * @fileoverview Baseline tests are a set of tests (in tests/baseline/) that
 * correspond to full comparisons of a generate .ts output based on a set of
 * Triples representing an entire ontology.
 */
import {basename} from 'path';

import {inlineCli} from '../helpers/main_driver';

test(`baseine_${basename(__filename)}`, async () => {
  const {actual} = await inlineCli(
    `
<http://schema.org/name> <http://schema.org/rangeIncludes> <http://schema.org/Text> .
<http://schema.org/name> <http://schema.org/domainIncludes> <http://schema.org/Thing> .
<http://schema.org/name> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<http://schema.org/Thing> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/height> <http://schema.org/rangeIncludes> <http://schema.org/Quantity> .
<http://schema.org/height> <http://schema.org/domainIncludes> <http://schema.org/Person> .
<http://schema.org/height> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<http://schema.org/Person> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Person> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Thing> .
<http://schema.org/Quantity> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Quantity> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Thing> .
<http://schema.org/Organization> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Organization> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Thing> .
<http://schema.org/Place> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/Place> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Thing> .
<http://schema.org/owner> <http://schema.org/rangeIncludes> <http://schema.org/Person> .
<http://schema.org/owner> <http://schema.org/domainIncludes> <http://schema.org/Organization> .
<http://schema.org/owner> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<http://schema.org/locatedIn> <http://schema.org/rangeIncludes> <http://schema.org/Place> .
<http://schema.org/locatedIn> <http://schema.org/domainIncludes> <http://schema.org/Organization> .
<http://schema.org/locatedIn> <http://schema.org/domainIncludes> <http://schema.org/Person> .
<http://schema.org/locatedIn> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<http://schema.org/EntryPoint> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/EntryPoint> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Thing> .
<http://schema.org/urlTemplate> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/1999/02/22-rdf-syntax-ns#Property> .
<http://schema.org/urlTemplate> <http://schema.org/rangeIncludes> <http://schema.org/URL> .
<http://schema.org/URL> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/URL> <http://www.w3.org/2000/01/rdf-schema#subClassOf> <http://schema.org/Text> .
<http://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://schema.org/DataType> .
<http://schema.org/Text> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://www.w3.org/2000/01/rdf-schema#Class> .
<http://schema.org/urlTemplate> <http://schema.org/domainIncludes> <http://schema.org/Organization> .
      `,
    ['--ontology', `https://fake.com/${basename(__filename)}.nt`]
  );

  expect(actual).toMatchInlineSnapshot(`
    "/** Used at the top-level node to indicate the context for the JSON-LD objects used. The context provided in this type is compatible with the keys and URLs in the rest of this generated file. */
    export type WithContext<T extends Thing> = T & {
        \\"@context\\": \\"https://schema.org\\";
    };

    type SchemaValue<T> = T | readonly T[];
    type IdReference = {
        /** IRI identifying the canonical address of this object. */
        \\"@id\\": string;
    };

    /** Boolean: True or False. */
    export type Boolean = true | false | \\"https://schema.org/True\\" | \\"https://schema.org/False\\";
    export const Boolean = {
        True: (\\"https://schema.org/True\\" as const),
        False: (\\"https://schema.org/False\\" as const)
    };

    /** A date value in {@link http://en.wikipedia.org/wiki/ISO_8601 ISO 8601 date format}. */
    export type Date = string;

    /** A combination of date and time of day in the form [-]CCYY-MM-DDThh:mm:ss[Z|(+|-)hh:mm] (see Chapter 5.4 of ISO 8601). */
    export type DateTime = string;

    /** Data type: Number. */
    export type Number = number;

    /** Data type: Text. */
    export type Text = string;

    /** DateTime represented in string, e.g. 2017-01-04T17:10:00-05:00. */
    export type Time = string;

    /** The basic data types such as Integers, Strings, etc. */
    export type DataType = Text | Number | Time | Date | DateTime | Boolean;

    type EntryPointLeaf = {
        \\"@type\\": \\"EntryPoint\\";
    } & ThingBase;
    export type EntryPoint = EntryPointLeaf | string;

    type OrganizationBase = ThingBase & {
        \\"locatedIn\\"?: SchemaValue<Place | IdReference>;
        \\"owner\\"?: SchemaValue<Person | IdReference>;
        \\"urlTemplate\\"?: SchemaValue<URL>;
    };
    type OrganizationLeaf = {
        \\"@type\\": \\"Organization\\";
    } & OrganizationBase;
    export type Organization = OrganizationLeaf | string;

    type PersonBase = ThingBase & {
        \\"height\\"?: SchemaValue<Quantity | IdReference>;
        \\"locatedIn\\"?: SchemaValue<Place | IdReference>;
    };
    type PersonLeaf = {
        \\"@type\\": \\"Person\\";
    } & PersonBase;
    export type Person = PersonLeaf | string;

    type PlaceLeaf = {
        \\"@type\\": \\"Place\\";
    } & ThingBase;
    export type Place = PlaceLeaf | string;

    type QuantityLeaf = {
        \\"@type\\": \\"Quantity\\";
    } & ThingBase;
    export type Quantity = QuantityLeaf | string;

    type ThingBase = Partial<IdReference> & {
        \\"name\\"?: SchemaValue<Text>;
    };
    type ThingLeaf = {
        \\"@type\\": \\"Thing\\";
    } & ThingBase;
    export type Thing = ThingLeaf | EntryPoint | Organization | Person | Place | Quantity;

    export type URL = Text;

    "
  `);
});
