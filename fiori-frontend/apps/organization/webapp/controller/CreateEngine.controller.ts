/// <reference types="@openui5/ts-types" />

import Controller from 'sap/ui/core/mvc/Controller';
import UIComponent from 'sap/ui/core/UIComponent';
import JSONModel from 'sap/ui/model/json/JSONModel';
import MessageBox from 'sap/m/MessageBox';
import MessageToast from 'sap/m/MessageToast';

import type Router from 'sap/ui/core/routing/Router';
import type ODataModel from 'sap/ui/model/odata/v4/ODataModel';
import type ODataListBinding from 'sap/ui/model/odata/v4/ODataListBinding';
import type Context from 'sap/ui/model/odata/v4/Context';

type EngineFormData = {
  engineSerialNumber: string;
  engineModel_ID: string;
  aircraft_ID: string;
  positionCode: string;
  status: string;
};

/**
 * @namespace jetbench.organization.controller
 */
export default class CreateEngine extends Controller {
  public onInit(): void {
    this.getRouter()
      .getRoute('createEngine')
      ?.attachPatternMatched(this.resetForm, this);
  }

  private getRouter(): Router {
    return (this.getOwnerComponent() as UIComponent).getRouter();
  }

  private getODataModel(): ODataModel {
    return this.getView()?.getModel() as ODataModel;
  }

  private async resetForm(): Promise<void> {
    const sFirstEngineModelID = await this.getFirstEntityID('/EngineModels');

    const oFormModel = new JSONModel({
      engineSerialNumber: '',
      engineModel_ID: sFirstEngineModelID,
      aircraft_ID: '',
      positionCode: '',
      status: 'UNINSTALLED',
    });

    this.getView()?.setModel(oFormModel, 'form');
  }

  private async getFirstEntityID(sPath: string): Promise<string> {
    const oListBinding = this.getODataModel().bindList(sPath);
    const aContexts = await oListBinding.requestContexts(0, 1);

    const oFirstContext = aContexts[0] as Context | undefined;

    if (!oFirstContext) {
      return '';
    }

    return oFirstContext.getProperty('ID') as string;
  }

  public onNavBack(): void {
    this.getRouter().navTo('main', {}, true);
  }

  public onCancel(): void {
    this.onNavBack();
  }

  public async onCreate(): Promise<void> {
    const oFormModel = this.getView()?.getModel('form') as JSONModel;
    const oData = oFormModel.getData() as EngineFormData;

    if (!oData.engineSerialNumber || !oData.engineModel_ID) {
      MessageBox.error('Serial number and engine model are required.');
      return;
    }

    const oPayload = {
      engineSerialNumber: oData.engineSerialNumber,
      engineModel_ID: oData.engineModel_ID,
      aircraft_ID: oData.aircraft_ID || null,
      positionCode: oData.positionCode || null,
      status: oData.status || 'UNINSTALLED',
    };

    this.getView()?.setBusy(true);

    try {
      const oListBinding = this.getODataModel().bindList(
        '/Engines',
        undefined,
        undefined,
        undefined,
        {
          $$updateGroupId: '$direct',
        },
      ) as ODataListBinding;

      const oContext = oListBinding.create(oPayload);

      await oContext.created();

      MessageToast.show('Engine created');
      this.onNavBack();
    } catch (e) {
      MessageBox.error('Create failed. Check Network tab / CAP logs.');
    } finally {
      this.getView()?.setBusy(false);
    }
  }
}
