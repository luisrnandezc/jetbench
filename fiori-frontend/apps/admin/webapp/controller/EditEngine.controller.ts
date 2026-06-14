/// <reference types="@openui5/ts-types" />

import UIComponent from 'sap/ui/core/UIComponent';
import Controller from 'sap/ui/core/mvc/Controller';
import MessageBox from 'sap/m/MessageBox';
import MessageToast from 'sap/m/MessageToast';
import type Event from 'sap/ui/base/Event';
import type Router from 'sap/ui/core/routing/Router';
import type ODataModel from 'sap/ui/model/odata/v4/ODataModel';
import type Context from 'sap/ui/model/odata/v4/Context';

/**
 * @namespace jetbench.admin.controller
 */
export default class EditEngine extends Controller {
  private static readonly UPDATE_GROUP_ID = 'editGroup';

  private organizationID = '';
  private aircraftID = '';
  private engineID = '';

  public onInit(): void {
    this.getRouter()
      .getRoute('editEngine')
      ?.attachPatternMatched(this.onRouteMatched, this);
  }

  /** Typed router helper. */
  private getRouter(): Router {
    return (this.getOwnerComponent() as UIComponent).getRouter();
  }

  /** Convenience helper for the default OData V4 model. */
  private getODataModel(): ODataModel {
    return this.getView()?.getModel() as ODataModel;
  }

  private onRouteMatched(oEvent: Event): void {
    const oParameters = oEvent.getParameters() as {
      arguments?: {
        organizationID?: string;
        aircraftID?: string;
        ID?: string;
      };
    };

    const sOrganizationID = oParameters.arguments?.organizationID;
    const sAircraftID = oParameters.arguments?.aircraftID;
    const sEngineID = oParameters.arguments?.ID;

    if (!sOrganizationID) {
      MessageBox.error('Missing Organization ID in route.');
      this.getRouter().navTo('main');
      return;
    }

    if (!sAircraftID) {
      MessageBox.error('Missing Aircraft ID in route.');
      this.getRouter().navTo('editOrganization', {
        ID: sOrganizationID,
      });
      return;
    }

    if (!sEngineID) {
      MessageBox.error('Missing Engine ID in route.');
      this.getRouter().navTo('editAircraft', {
        organizationID: sOrganizationID,
        ID: sAircraftID,
      });
      return;
    }

    this.organizationID = sOrganizationID;
    this.aircraftID = sAircraftID;
    this.engineID = sEngineID;

    const sPath = `/Engines(${sEngineID})`;

    this.getView()!.setBusy(true);

    this.getView()?.bindElement({
      path: sPath,
      parameters: {
        $expand: 'engineModel,aircraft,organization',
        $$updateGroupId: EditEngine.UPDATE_GROUP_ID,
      },
      events: {
        change: () => {
          const oContext = this.getView()?.getBindingContext();

          if (!oContext) {
            MessageBox.error(`Engine not found for path: ${sPath}.`);
            this.getRouter().navTo('editAircraft', {
              organizationID: sOrganizationID,
              ID: sAircraftID,
            });
            return;
          }

          this.getView()?.setBusy(false);
        },
        dataRequested: () => {
          this.getView()?.setBusy(true);
        },
        dataReceived: (oDataEvent: Event) => {
          this.getView()?.setBusy(false);

          const oParameters = oDataEvent.getParameters() as {
            error?: unknown;
          };

          const oError = oParameters.error;

          if (oError) {
            MessageBox.error(
              `Failed to load engine data for path: ${sPath}. Check Network tab / CAP logs.`,
            );
          }
        },
      },
    });
  }

  public onNavBack(): void {
    this.getRouter().navTo('editAircraft', {
      organizationID: this.organizationID,
      ID: this.aircraftID,
    });
  }

  public onCancel(): void {
    this.getODataModel().resetChanges(EditEngine.UPDATE_GROUP_ID);
    this.onNavBack();
  }

  public async onSave(): Promise<void> {
    this.getView()?.setBusy(true);
    try {
      await this.getODataModel().submitBatch(EditEngine.UPDATE_GROUP_ID);
      MessageToast.show('Engine updated');
      this.onNavBack();
    } catch (e) {
      MessageBox.error('Update failed. Check the Network tab / CAP logs');
    } finally {
      this.getView()?.setBusy(false);
    }
  }

  public onDeleteEngine(): void {
    const context = this.getView()?.getBindingContext() as Context | null;

    if (!context) {
      MessageBox.error('No engine loaded to delete');
      return;
    }

    const engineSerialNumber =
      (context.getProperty('engineSerialNumber') as string) ?? '';

    const label = engineSerialNumber || this.aircraftID || 'unknown engine';

    MessageBox.confirm(
      `This will permanently delete engine ${label}. Do you want to continue?`,
      {
        title: 'Delete Engine',
        emphasizedAction: MessageBox.Action.DELETE,
        actions: [MessageBox.Action.DELETE, MessageBox.Action.CANCEL],
        onClose: (action: string | null): void => {
          if (action !== MessageBox.Action.DELETE) return;
          void this.handleDelete(context);
        },
      },
    );
  }

  private async handleDelete(context: Context): Promise<void> {
    this.getView()?.setBusy(true);

    try {
      // Send DELETE immediately; editGroup batches updates (SAVE uses submitBatch) but never flushes deletes.
      await context.delete('$direct');

      MessageToast.show('Engine deleted');
      this.onNavBack();
    } catch (e) {
      MessageBox.error('Delete failed. Check Network tab / CAP logs.');
    } finally {
      this.getView()?.setBusy(false);
    }
  }
}
