import Controller from "sap/ui/core/mvc/Controller";
import type UIComponent from "sap/ui/core/UIComponent";

/**
 * @namespace jetbench.registry.controller
 */
export default class App extends Controller {
  public onInit(): void {
    const component = this.getOwnerComponent() as UIComponent;
    const router = component.getRouter();
    if (!router) {
      return;
    }

    // Defer past rendering — initialize()/navTo() from onAfterRendering triggers
    // "Render must not be called within Before or After Rendering Phase".
    setTimeout(() => {
      router.initialize();
      router.navTo("main", {}, true);
    }, 0);
  }
}
