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
import { Component, Input, NgZone, SimpleChange } from '@angular/core';
import { saveAs } from 'file-saver';
@Component({
	selector: 'tree-view',
  templateUrl: 'tree-view.component.html',
	styleUrls: ['tree-view.component.scss']
})

export class TreeViewComponent {
	@Input() data: any;
  @Input() queryId: any;

  dataSample =
  [
    {
            "FeedPolicy": {
                    "DataverseName": "Metadata",
                    "PolicyName": "AdvancedFT_Elastic",
                    "Description": "Basic Monitored Fault-Tolerant Elastic",
                    "Nest" : {
                      "DataverseNameNest": "Metadata",
                      "PolicyNameNest": "AdvancedFT_Elastic",
                      "DescriptionNest": "Basic Monitored Fault-Tolerant Elastic",
                      "Nest2" : {
                        "DataverseNameNest2": "Metadata",
                        "PolicyNameNest2": "AdvancedFT_Elastic",
                        "DescriptionNest2": "Basic Monitored Fault-Tolerant Elastic",
                      },
                    },
                    "Properties": [
                            {
                                    "Name": "elastic",
                                    "Value": "true"
                            },
                            {
                                    "Name": "flowcontrol.enabled",
                                    "Value": "true",
                                    "NestArray" : {
                                      "DataverseNameNest": "Metadata",
                                      "PolicyNameNest": "AdvancedFT_Elastic",
                                      "DescriptionNest": "Basic Monitored Fault-Tolerant Elastic",
                                    },
                            },
                            {
                                    "Name": "logging.statistics",
                                    "Value": "true"
                            }
                    ]
            }
    },
    {
            "FeedPolicy": {
                    "DataverseName": "Metadata",
                    "PolicyName": "Basic",
                    "Description": "Basic",
                    "Properties": [
                            {
                                    "Name": "elastic",
                                    "Value": "false"
                            }
                    ]
            }
    },
    {
            "FeedPolicy": {
                    "DataverseName": "Metadata",
                    "PolicyName": "Discard",
                    "Description": "FlowControl 100% Discard during congestion",
                    "Properties": [
                            {
                                    "Name": "max.spill.size.on.disk",
                                    "Value": "false"
                            },
                            {
                                    "Name": "max.fraction.discard",
                                    "Value": "100"
                            },
                            {
                                    "Name": "elastic",
                                    "Value": "false"
                            },
                            {
                                    "Name": "flowcontrol.enabled",
                                    "Value": "true"
                            },
                            {
                                    "Name": "logging.statistics",
                                    "Value": "true"
                            }
                    ]
            }
    },
    {
            "FeedPolicy": {
                    "DataverseName": "Metadata",
                    "PolicyName": "Spill",
                    "Description": "FlowControl 100% Spill during congestion",
                    "Properties": [
                            {
                                    "Name": "max.spill.size.on.disk",
                                    "Value": "-1"
                            },
                            {
                                    "Name": "elastic",
                                    "Value": "false"
                            },
                            {
                                    "Name": "flowcontrol.enabled",
                                    "Value": "true"
                            },
                            {
                                    "Name": "spill.to.disk.on.congestion",
                                    "Value": "true"
                            }
                    ]
            }
    }
]


  jsonVisible: any;
  jsonData: any;
  jsonPath_: any = '[]:';
	rawData: any;
  treeData: any;
	treeData_: any;
	metrics: any;
	currentIndex: any = 0;
	/* see 10 records as initial set */
	pagedefaults: any = { pageIndex: 0, pageSize:10, lenght: 0};
	pageSizeOptions = [5, 10, 25, 100, 200];
	viewMode = 'JSON';
	showGoTop = false;
	showGoBottom = false;

	private eventOptions: boolean|{capture?: boolean, passive?: boolean};

  constructor( private ngZone: NgZone) {}

  ngOnInit() {
		this.rawData = this.data['results'];
		if (this.rawData) {
			this.showResults(this.pagedefaults);
		}

		this.ngZone.runOutsideAngular(() => {
			window.addEventListener('scroll', this.scroll, <any>this.eventOptions);
		});
	}

	ngOnChanges(changes: SimpleChange) {
		this.rawData = this.data['results'];
		if (this.rawData) {
			this.showResults(this.pagedefaults);
		}
	}

	/*
	* Filters the resulst array of JSON Objects
	*/
	filter(element, index, array) {
		var params = Object.create(this) ;
		var startRange = (params.pageSize * params.pageIndex)
		return index >= startRange && index < startRange + params.pageSize;
	}

	showResults(range) {
		this.currentIndex = range.pageIndex;
//    this.treeData = this.dataSample;
    this.treeData = this.rawData.filter(this.filter, range);


		if (this.treeData.length > 0) {
			this.metrics = this.data['metrics'];
			this.metrics['resultSizeKb'] = (this.metrics.resultSize/1024).toFixed(2);
			var myData_ = [];
      for (let i = 0; i < this.treeData.length; i++) {
				let  nodeContent= {};
				// mat-paginator start counting from 1, thats why the i+1 trick
        myData_.push(this.generateTree(this.treeData[i], '/', nodeContent, (range.pageSize * range.pageIndex) + (i + 1), 0));
			}

			this.treeData_ = myData_;

      /* Prepare the JSON view */
      this.jsonData = JSON.stringify(this.treeData, null, 8)

    } else {
      console.log('no data')
      this.treeData = [];
    }
	}

    /*
	* Shows JSON text
	*/
    showJSON() {
		this.jsonVisible = !this.jsonVisible;
		if (this.jsonVisible) {
			this.viewMode = 'TREE';
		}
		else {
			this.viewMode = 'JSON';
		}
    }

    /*
	* Export to CSV
	*/
    exportToCSV(){
		var exportOutput = JSON.stringify(this.rawData, null, 4);
		var blob = new Blob([this.jsonData], {type: "text/csv;charset=utf-8"});
		saveAs(blob, "Asterix-results.csv");
	}

	/*
	*  Export to plain text
	*/
    exportToText(){
		var exportOutput = JSON.stringify(this.rawData, null, 4);
		var blob = new Blob([exportOutput], {type: "text/json;charset=utf-8"});
		saveAs(blob, "Asterix-results.json");
	}

  /*
  * This function converts the json object into a node/array graph structure ready to be display as a tree
  * it will also augment the nodes with a link containing the path that the elements occupies in the json graph
  */
  generateTree(node, nodeLink, rootMenu, index, level): any {

		// Check in case the root object is not defined properly
		if (rootMenu === {}) {
			rootMenu = { item: '', label: 'K', key: '', value: '', link: '/', visible: true, children: [], level: 0};
		}

		let nodeArray = [];

		// Going through all the keys in a node looking for objects or array of key values
    // and create a sub menu if is an object.
		Object.keys(node).map((k) => {

			if (typeof node[k] === 'object') {
        if(Array.isArray(node[k]) ){
          let nodeObject = { nested: true, item: '', label: '', key: '', value: '', type: 'ARRAY', link: '/', visible: false, children: [], level: level};
          nodeObject.item = index;
          nodeObject.label = k;
          nodeObject.key = k;
          nodeObject.value = node[k];
          nodeObject.link = nodeLink + '/' + k;
          nodeObject.level = level;
          level = level + 1;
          // if this is an object then a new node is created and
          // recursive call to find and fill with the nested elements
          let newNodeObject = this.generateTree(node[k], nodeObject.link, nodeObject, index, level);

          // if this is the first node, then will become the root.
          if (rootMenu.children) {
            rootMenu.children.push(newNodeObject)
          } else {
            rootMenu = newNodeObject;
            newNodeObject.type = 'ROOT';
          }
        } else {
          let nodeObject = { nested: true, item: '', label: '', key: '', value: '', type: 'OBJECT', link: '/', visible: true, children: [], level: level};
          nodeObject.item = index;
          nodeObject.label = k;
          nodeObject.key = k;
          nodeObject.value = node[k];
          nodeObject.link = nodeLink + '/' + k;
          nodeObject.level = level;
          level = level + 1;
          // if this is an object then a new node is created and
          // recursive call to find and fill with the nested elements
          let newNodeObject = this.generateTree(node[k], nodeObject.link, nodeObject, index, level);

          // if this is the first node, then will become the root.
          if (rootMenu.children) {
            rootMenu.children.push(newNodeObject)
          } else {
            nodeObject.nested = false;
            newNodeObject.visible = false;
            newNodeObject.type = 'ROOT';
            rootMenu = newNodeObject
          }
        }
			}
      else {
				// Array of key values converted into a unique string with a : separator
				let nodeKeyValue = { nested: false, item: '', label: '', key: '', value: '', type: 'KEYVALUE', link: '/', visible: true, children: [], level: level};
				nodeKeyValue.item = index;
				nodeKeyValue.label = k + " : " + node[k];
				nodeKeyValue.key = k;
				nodeKeyValue.value = node[k];
        nodeKeyValue.link = nodeLink + '/' + k + '/' + node[k];
        nodeKeyValue.level = level;
				nodeArray.push(nodeKeyValue);
			}
		})

		// The array will be added as value to a parent key.
		if (nodeArray.length > 0) {
			rootMenu.children = nodeArray.concat(rootMenu.children)
		}

		return rootMenu
	}

	gotoTop() {
		window.document.getElementById('top').scrollIntoView();
	}

	ngOnDestroy() {
    window.removeEventListener('scroll', this.scroll, <any>this.eventOptions);
	}

   scroll = ($event): void => {
		  this.ngZone.run(() => {
			this.showGoTop = false;
			this.showGoBottom = true;
			var element = document.getElementById('top');
			if (element) {
				var bodyRect = document.body.getBoundingClientRect(),
				elemRect = element.getBoundingClientRect(),
				offset   = elemRect.top - bodyRect.top;
				var elementOptimizedPlan = document.getElementById('OPTIMIZED PLAN');
				var elementPlan = document.getElementById('PLAN');

        // this is calculated just manually
        var elementOptimizedPlanOffset = 0;
        if (elementOptimizedPlan) {
          elementOptimizedPlanOffset = elementOptimizedPlan.clientHeight;
        }

        var elementPlanOffset = 0;
        if (elementPlan) {
          elementPlanOffset = elementPlan.clientHeight;
        }

				if (window.pageYOffset > 600 + elementPlanOffset + elementOptimizedPlanOffset) {
					this.showGoTop = true;
				} else {
					this.showGoBottom = false;
				}
			}
		})
  };

  changeJsonPathValue(event) {
    this.jsonPath_ = event.link;
  }
}