# Taking your Angular [Elements] to go

<br>
<div class="r-hstack justify-around" style="max-height: 50px;">

  <div class="r-hstack">
    <img src="assets/AngularConnect.webp" style="max-height: 1.3em;">
    AngularConnect 2025
  </div>
  <img src="assets/ignite-ui-logo-2021-update-white.svg" style="max-height: 1.3em;">

</div>

---

## Hey 👋

![Damyan Petev](assets/Damyan.png) <!-- .element: class="profile-image" -->

Damyan Petev — Product Architect, Infragistics

![Konstantin Dinev](assets/konstantin-dinev.jpg) <!-- .element: class="profile-image" -->

Konstantin Dinev — Director Of Product Development, Infragistics

---
<!-- .slide: data-auto-animate -->
> 2016 Me: "Zone.JS hooray!"

---
<!-- .slide: data-auto-animate -->
> 2016 Me: "Zone.JS hooray!"

> And Now: Well...

---
<!-- .slide: data-auto-animate -->
> 2016 Me: "Zone.JS hooray!"

> And Now: Well...

![Old Screenshot Joke](assets/haha-laughing.gif)

Note: For context: Presenter image is about as old as a previous presentation given as Angular 2 was just launching that welcomed our new monkey-patching overlord (in light of ye ol' $digest cycle struggles) and has aged like fine.. milk, in the current age of going zoneless :)
---

## What are Angular Elements?

- Angular components packaged as standards-based Web Components (custom elements). <!-- .element class="fragment" -->
- Let you use Angular UI in non-Angular apps (static HTML, React, Vue, plain JS). <!-- .element class="fragment" -->
- Built using @angular/elements and Angular's compiler to create a Custom Element. <!-- .element class="fragment" -->

---

<!-- .slide: data-auto-animate -->
## Why Elements?

We've done the research comparing Elements vs bespoke implementations per framework <!-- .element class="fragment" -->

And the results clear <!-- .element class="fragment" -->

---

<!-- .slide: data-auto-animate -->
## Why Elements?

- Less initial effort <!-- .element class="fragment" -->
- Single code base -> less perpetual maintenance effort <!-- .element class="fragment" -->

---

<!-- .slide: data-auto-animate -->
## How Angular Elements work

- Wrap an Angular component inside a Custom Element class. <!-- .element class="fragment" -->
- On connectedCallback, Angular bootstraps a small element-specific injector and component factory. <!-- .element class="fragment" -->
- Inputs map to element attributes/properties; outputs become DOM events. <!-- .element class="fragment" -->
- ?? Can lazy-load Angular runtime per element to reduce initial cost. <!-- .element class="fragment" -->

---

<!-- .slide: data-auto-animate -->
## How Angular Elements work

Inside `createCustomElement`:

<pre><code  class="language-typescript" data-line-numbers="4,6|9|12,14|19-20">
  class NgElementImpl extends NgElement {

    override attributeChangedCallback(attrName: string, _, newValue: string): void {
      const [propName, transform] = attributeToPropertyInputs[attrName]!;
      this.ngElementStrategy.setInputValue(propName, newValue, transform);
    }

    override connectedCallback(): void {
      // [...]
      if (this.ngElementStrategy.events)
        this.subscribeToEvents();
      // [...]
      this.ngElementStrategy.connect(this);
      // [...]
    }
  }
  // [...]
  inputs.forEach(({propName, transform}) => {
    Object.defineProperty(NgElementImpl.prototype, propName, { ... });
  });
  // [...]
  return NgElementImpl;
</code></pre>

---

<!-- .slide: data-auto-animate -->
## How Angular Elements work

Inside `ComponentNgElementStrategy`:

<pre><code  class="language-typescript" data-line-numbers="8|10-11|13">
  protected initializeComponent(element: HTMLElement) {
    const childInjector = Injector.create({providers: [], parent: this.injector});
    const projectableNodes = extractProjectableNodes(
      element,
      this.componentFactory.ngContentSelectors,
    );
    this.componentRef = this.componentFactory.create(childInjector, projectableNodes, element);

    this.initializeInputs();
    this.initializeOutputs(this.componentRef);

    this.appRef.attachView(this.componentRef.hostView);
    this.componentRef.hostView.detectChanges();
  }
</code></pre>

---

```html
<weather-widget selected-location-name="London"></weather-widget>
```

✨ <!-- .element class="fragment custom current-visible pulse-scale"-->

<weather-widget selected-location-name="London"></weather-widget> <!-- .element class="fragment current-visible" -->

---

<!-- .slide: data-auto-animate -->
## Limitations of Angular Elements

- Child components and declarative structure <!-- .element class="fragment" -->
- Methods & other component API <!-- .element class="fragment" -->
- Templates <!-- .element class="fragment" -->
- Lifecycle reuse <!-- .element class="fragment" -->

---

<!-- .slide: data-auto-animate -->
## How Ignite UI addresses these limitations*

\* to the best of our abilities 😉 <!-- .element class="fragment" -->

---

![A sad robot needing more metadata](assets/more-metadata.png)

---

### The Elements Analyzer

<pre><code  class="language-typescript" data-line-numbers="3-4,7|14-15|23-24">
export class Analyzer {
  private checker: ts.TypeChecker;
  private program: ts.Program;

  private get sourceFiles() {
    return this.program.getSourceFiles()
      .filter(file => !file.isDeclarationFile);
  }

  private getComponents(source: ts.NodeArray&lt;ts.Node&gt;) {
    const isComponent = (dec: ts.Decorator) => getDecoratorName(dec) === 'Component';
    return source
      .filter(ts.isClassDeclaration)
      .filter(x => getDecorators(x)!.some(isComponent))
      .map(comp => new AnalyzerComponent(comp, this.checker));
  }
  // [...]
  public async analyze() {
    this.sourceFiles.flatMap(file => this.getComponents(file.statements))
      .forEach(comp => this.configMap.set(comp.name, comp));

    this.resolvedMap = this.resolve();
    await this.printer.run(this.resolvedMap);
  }
</code></pre>
---

### Said Metadata

<pre><code  class="language-typescript" data-line-numbers="4-5|6-7|10|11-12,15|16">
export var registerConfig = [
{
  component: IgxColumnComponent,
  selector: "igc-column",
  parents: [
    IgxGridComponent,
    // [...]
  ],
  contentQueries: [],
  additionalProperties: [
    { name: "selected", writable: true },
    // [...]
  ],
  methods: ["pin", "unpin", "move", "autosize"],
  templateProps: [
    "summaryTemplate",
    "bodyTemplate",
    "headerTemplate",
    "inlineEditorTemplate",
    "errorTemplate",
    "filterCellTemplate",
  ],
  // [...]
</code></pre>

---
<!-- .slide: data-auto-animate -->
### Shopping list

- Adding methods to prototype
- Handling of child components with: <!-- .element class="fragment" -->
  - Parent injector structure, so parent-child mechanisms work <!-- .element class="fragment" -->
  - Query updates <!-- .element class="fragment" -->
- Templates handling <!-- .element class="fragment" --> <aside>(we chose Lit, so Lit➡️TemplateRef)</aside> <!-- .element class="fragment" -->
- Lifecycle modifications inside templates (quite niche) <!-- .element class="fragment" -->

---
### Custom create element

<pre><code  class="language-typescript" data-line-numbers="7|12|15|18|22-23">
export function createIgxCustomElement(component: Type, config: IgxNgElementConfig): IgxElementConstructor {
  const strategyFactory = new IgxCustomNgElementStrategyFactory(component, config.injector, config.registerConfig);

  guardAttributeNames(strategyFactory);

  const elementCtor = createCustomElement(component, {
    ...config,
    strategyFactory
  });

  const componentConfig = config.registerConfig?.find(x => x.component === component);

  for (const method of componentConfig?.methods) {
    elementCtor.prototype[method] = function() {
      const instance = this.ngElementStrategy.componentRef.instance;
      return this.ngElementStrategy.runInZone(() => 
        instance[method].apply(instance, arguments));
    }
  }

  componentConfig?.additionalProperties.forEach((p) => {
    // Reuse `createCustomElement`'s approach for Inputs, should work for any prop too
  });
  // [...]
</code></pre>

---
## How Ignite UI addresses these limitations

<pre><code  class="language-typescript" data-line-numbers="2|8|14|17|19|26|35,38|40|45-46|52|55-56|64|67-68|71-72">
class IgxCustomNgElementStrategy extends* ComponentNgElementStrategy {
  // [...]

  protected get templateWrapper(): TemplateWrapperComponent {
      if (!this._templateWrapperRef) {
          const viewRef = componentRef.injector.get(ViewContainerRef);
          this._templateWrapperRef = viewRef.createComponent(TemplateWrapperComponent);
      }
      return this._templateWrapperRef.instance;
  }
  // [...]

  protected override async initializeComponent(element: HTMLElement) {
    // [...]
    const parents: WeakRef<IgcNgElement>[] = [];
    const componentConfig = this.config?.find(x => x.component === this._componentFactory.componentType);

    const configParents = componentConfig?.parents
      .map(parentType => this.config.find(x => x.component === parentType))
      .filter(x => x.selector);

    if (configParents?.length) {
      let node = element as IgcNgElement;
      while (node?.parentElement) {
        node = node.parentElement.closest&lt;IgcNgElement&gt;(configParents.flatMap(x => [
          x.selector,
          reflectComponentType(x.component).selector
        ]).join(','));
        if (node) {
          parents.push(new WeakRef(node));
        }
      }
      // select closest of all possible config parents
      let parent = parents[0]?.deref();

      // Collected parents may include direct Angular HGrids, so only wait for configured parent elements:
      const configParent = configParents.find(x => x.selector === parent?.tagName.toLocaleLowerCase());
      if (configParent && !customElements.get(configParent.selector)) {
        await customElements.whenDefined(configParent.selector);
      }

      if (parent?.ngElementStrategy) {
        this.parentElement = new WeakRef(parent);
        let parentComponentRef = await parent?.ngElementStrategy[ComponentRefKey];
        parentInjector = parentComponentRef?.injector;
        // [...]
      }
    }

    // need to be able to reset the injector (as protected) to the parent's to call super normally
    this.injector = parentInjector || this._injector;

    /** Modified copy of super.initializeComponent: */
    if (parentAnchor && parentInjector) {
      // attempt to attach the newly created ViewRef to the parents's instead of the App global
      // [...]
    } else if (!parentAnchor) {
      this.appRef.attachView(this.componentRef.hostView);
      this.componentRef.hostView.detectChanges();
    }
    // [...]

    const parentQueries = this.getParentContentQueries(componentConfig, parents, configParents);

    for (const { parent, query } of parentQueries) {
      if (query.isQueryList) {
        parent.ngElementStrategy.scheduleQueryUpdate(query.property);
      } else {
        const parentRef = await parent.ngElementStrategy[ComponentRefKey];
        parentRef.instance[query.property] = componentRef.instance;
        parentRef.changeDetectorRef.detectChanges();
      }
    }

    // [...]
    });
  }
  // [...]
</code></pre>

---

## How Ignite UI addresses these limitations

<pre><code  class="language-html" data-line-numbers="2|4|5">
@for (templateFunc of templateFunctions; track templateFunc) {
    <ng-template let-context="context">
        <div #container style="display: contents;"></div>
        {{ litRender(container, templateFunc, context) }}
    </ng-template>
}
</code></pre>

---
## It's alive!

< 😊 here be grid >

---
## Summary
```mermaid
%%{init: { "flowchart": { "useMaxWidth": false } }}%%
flowchart TD
    AB[<img src='assets/app-builder-logo.svg' width="200"/>&emsp;&emsp;]:::large-->A[<img src="./assets/angular.svg">&emsp;&emsp;   Angular   &emsp;&emsp;];
```
---
## Summary
```mermaid
%%{init: { "flowchart": { "useMaxWidth": false } }}%%
flowchart TD
    AB[<img src='assets/app-builder-logo.svg' width="200"/>&emsp;&emsp;]:::large-->A[<img src="./assets/angular.svg">&emsp;&emsp;   Angular   &emsp;&emsp;];
    AB-->B[<img src="./assets/web-components.svg"> Web Components];
```
---
## Summary
```mermaid
%%{init: { "flowchart": { "useMaxWidth": false } }}%%
flowchart TD
    AB[<img src='assets/app-builder-logo.svg' width="200"/>&emsp;&emsp;]:::large-->A[<img src="./assets/angular.svg">&emsp;&emsp;   Angular   &emsp;&emsp;];
    AB-->B[<img src="./assets/web-components.svg" width="50"> Web Components ];
    AB-->C[<img src="./assets/react.svg">&emsp;&emsp;   React   &emsp;&emsp;];
```
---
## Summary
```mermaid
%%{init: { "flowchart": { "useMaxWidth": false } }}%%
flowchart TD
    AB[<img src='assets/app-builder-logo.svg' width="200"/>&emsp;&emsp;]:::large-->A[<img src="./assets/angular.svg">&emsp;&emsp;   Angular   &emsp;&emsp;];
    AB-->B[<img src="./assets/web-components.svg"> Web Components ];
    AB-->C[<img src="./assets/react.svg">&emsp;&emsp;   React   &emsp;&emsp;];
    AB-->D[<img src="./assets/blazor.svg">&emsp;&emsp;   Blazor   &emsp;&emsp;];
```

---

## We still need more

- Lifecycle QoL-s <!-- .element class="fragment" -->
- Packaging <!-- .element class="fragment" -->
- Differential compile <!-- .element class="fragment" -->
- < insert other minor issues here > <!-- .element class="fragment" -->

---
## Giveaway ⏰🥽

![Giveaway QR Code](assets/giveaway-qr-code.png) <!-- .element style="width:50%" -->

---
## Questions ❔

![Giveaway QR Code](assets/giveaway-qr-code.png) <!-- .element style="width:50%" -->

---

## Thank you!

@DamyanPetev @KonstantinDinev <!-- .element class="fragment" -->


[github.com/IgniteUI/igniteui-angular](https://github.com/IgniteUI/igniteui-angular/tree/master/projects/igniteui-angular-elements) <!-- .element class="fragment" -->
[github.com/damyanpetev/angular-connect-2025](https://github.com/damyanpetev/angular-connect-2025) <!-- .element class="fragment" -->
