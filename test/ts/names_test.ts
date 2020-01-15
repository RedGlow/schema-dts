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
import {expect} from 'chai';

import {UrlNode} from '../../src/triples/types';
import {toClassName} from '../../src/ts/util/names';

describe('toClassName', () => {
  it('operates normally, with typical inputs', () => {
    expect(toClassName(UrlNode.Parse('https://schema.org/Person')))
        .to.equal('Person');
    expect(toClassName(UrlNode.Parse('https://schema.org/Person3')))
        .to.equal('Person3');
    expect(toClassName(UrlNode.Parse('http://schema.org/Person')))
        .to.equal('Person');
    expect(toClassName(
               UrlNode.Parse('http://schema.org/Organization4Organization')))
        .to.equal('Organization4Organization');
  });

  it('handles illegal TypeScript identifier characters', () => {
    expect(toClassName(UrlNode.Parse('https://schema.org/Person-4')))
        .to.equal('Person_4');
    expect(toClassName(UrlNode.Parse('https://schema.org/Person%4')))
        .to.equal('Person_4');
    expect(toClassName(UrlNode.Parse('https://schema.org/Person%204')))
        .to.equal('Person_4');
    expect(toClassName(UrlNode.Parse('https://schema.org/Person, 4')))
        .to.equal('Person__4');

    expect(toClassName(UrlNode.Parse('https://schema.org/3DModel')))
        .to.equal('_3DModel');
    expect(toClassName(UrlNode.Parse('https://schema.org/3DModel-5')))
        .to.equal('_3DModel_5');
  });
});
