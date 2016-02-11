﻿/*
 *  Power BI Visualizations
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved. 
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *   
 *  The above copyright notice and this permission notice shall be included in 
 *  all copies or substantial portions of the Software.
 *   
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */



module powerbitests.customVisuals {
    import VisualClass = powerbi.visuals.samples.StreamGraph;

    describe("StreamGraph", () => {
        describe('capabilities', () => {
            it("registered capabilities", () => expect(VisualClass.capabilities).toBeDefined());
        });

        describe("DOM tests", () => {
            let visualBuilder: StreamGraphBuilder;
            let dataViews: powerbi.DataView[];

            beforeEach(() => {
                visualBuilder = new StreamGraphBuilder();
                dataViews = [new powerbitests.customVisuals.sampleDataViews.ProductSalesByDateData().getDataView()];
            });

            it("svg element created", () =>expect(visualBuilder.mainElement[0]).toBeInDOM());

            it("update", (done) => {
                visualBuilder.update(dataViews);
                setTimeout(() => {
                    expect(visualBuilder.mainElement.children("path.layer").length)
                        .toBe(dataViews[0].categorical.values.length);
                    expect(visualBuilder.mainElement.children("g").children("g.x.axis").children("g.tick"))
                        .toBeInDOM();
                    expect(visualBuilder.mainElement.children("g").children("g.y.axis").children("g.tick"))
                        .toBeInDOM();
                    done();
                }, powerbitests.DefaultWaitForRender);
            });
        });
    });

    class StreamGraphBuilder extends VisualBuilderBase<VisualClass> {
        constructor(height: number = 200, width: number = 300, isMinervaVisualPlugin: boolean = false) {
            super(height, width, isMinervaVisualPlugin);
            this.build();
            this.init();
        }
        
        public get mainElement() {
            return this.element.children('svg.streamGraph');
        }

        private build(): void {
            this.visual = new VisualClass();
        }
    }
}