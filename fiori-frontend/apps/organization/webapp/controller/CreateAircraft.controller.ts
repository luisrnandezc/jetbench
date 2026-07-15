/// <reference types="@openui5/ts-types" />

import Controller from 'sap/ui/core/mvc/Controller';
import UIComponent from 'sap/ui/core/UIComponent';
import JSONModel from 'sap/ui/model/json/JSONModel';
import MessageBox from 'sap/m/MessageBox';
import MessageToast from 'sap/m/MessageToast';

import type Router from 'sap/ui/core/routing/Router';
import type ODataModel from 'sap/ui/model/odata/v4/ODataModel';
import type ODataListBinding from 'sap/ui/model/odata/v4/ODataListBinding';

type AircraftFormData = {
  tailNumber: string;
  serialNumber: string;
  aircraftModel_ID: string;
  defaultEngineModel_ID: string;
  status: string;
};

/**
 * @namespace jetbench.organization.controller
 */
export default class CreateAircraft extends Controller {
  public onInit(): void {
    this.getRouter()
      .getRoute('createAircraft')
      ?.attachPatternMatched(this.resetForm, this);
  }

  private getRouter(): Router {
    return (this.getOwnerComponent() as UIComponent).getRouter();
  }

  private getODataModel(): ODataModel {
    return this.getView()?.getModel() as ODataModel;
  }

  private resetForm(): void {
    const oFormModel = new JSONModel({
      tailNumber: '',
      serialNumber: '',
      aircraftModel_ID: '',
      defaultEngineModel_ID: '',
      status: 'ACTIVE',
    });

    this.getView()?.setModel(oFormModel, 'form');
  }

  public onNavBack(): void {
    this.getRouter().navTo('main', {}, true);
  }

  public onCancel(): void {
    this.onNavBack();
  }

  public async onCreate(): Promise<void> {
    const oFormModel = this.getView()?.getModel('form') as JSONModel;
    const oData = oFormModel.getData() as AircraftFormData;

    if (!oData.tailNumber || !oData.serialNumber || !oData.aircraftModel_ID) {
      MessageBox.error(
        'Tail number, serial number, and aircraft model are required.',
      );
      return;
    }

    const oPayload = {
      tailNumber: oData.tailNumber,
      serialNumber: oData.serialNumber,
      aircraftModel_ID: oData.aircraftModel_ID,
      defaultEngineModel_ID: oData.defaultEngineModel_ID || null,
      status: oData.status || 'ACTIVE',
    };

    this.getView()?.setBusy(true);

    try {
      const oListBinding = this.getODataModel().bindList(
        '/Aircraft',
        undefined,
        undefined,
        undefined,
        {
          $$updateGroupId: '$direct',
        },
      ) as ODataListBinding;

      const oContext = oListBinding.create(oPayload);

      await oContext.created();

      MessageToast.show('Aircraft created');
      this.onNavBack();
    } catch (e) {
      MessageBox.error('Create failed. Check Network tab / CAP logs.');
    } finally {
      this.getView()?.setBusy(false);
    }
  }
}
