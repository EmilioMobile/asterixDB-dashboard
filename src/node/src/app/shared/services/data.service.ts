/*
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
import { Injectable } from '@angular/core';

/* Naive implementation of a data cache for large enough dataset */
@Injectable()
export class DataService {

    serverResponses: any[] = [];

    constructor() {}

    push(results) {
      this.serverResponses.push(results)
      return this.serverResponses.length - 1; // Return index
    }

    delete(index) {
      //this.serverResponses.(results)
      //return this.serverResponses.length - 1; // The index
    }

    find(index) {
      return this.serverResponses[index];
    }
}