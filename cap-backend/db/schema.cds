namespace jetbench;

using { cuid, managed } from '@sap/cds/common';

entity Organization : cuid, managed {
  name    : String(100) not null;
  code    : String(20) not null;
  country : String(50);

  users    : Association to many User on users.organization = $self;
  aircraft : Association to many Aircraft on aircraft.organization = $self;
  engines  : Association to many Engine on engines.organization = $self;
}

entity User : cuid, managed {
  firstName      : String(80) not null;
  lastName       : String(80) not null;
  email          : String(120) not null;
  role           : String(40) not null;
  isActive       : Boolean default true;

  organization   : Association to Organization not null;
}

entity AircraftModel : cuid, managed {
      code            : String(20) not null;
      name            : String(100) not null;
      manufacturer    : String(100);
      numberOfEngines : Integer not null;
      engineType      : String(20);

      aircraft        : Association to many Aircraft on aircraft.aircraftModel = $self;
}

entity EngineModel : cuid, managed {
      code         : String(20) not null;
      name         : String(100) not null;
      manufacturer : String(100);
      tbo          : Integer not null @assert.range: [1, 10000];
}

entity Aircraft : cuid, managed {
      tailNumber           : String(20) not null;
      serialNumber         : String(50) not null;
      aircraftModel        : Association to AircraftModel not null;
      installedEngineModel : Association to EngineModel;
      totalFlightHours     : Decimal(10,2) default 0;
      totalCycles          : Integer default 0;

      organization         : Association to Organization not null;
      engines              : Association to many Engine on engines.aircraft = $self;
}

entity Engine : cuid, managed {
      engineSerialNumber : String(50) not null;
      positionCode       : String(10);
      engineModel        : Association to EngineModel not null;
      aircraft           : Association to Aircraft;
      totalFlightHours   : Decimal(10,2) default 0;
      totalCycles        : Integer default 0;

      organization       : Association to Organization not null;
}

