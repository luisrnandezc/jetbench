using { jetbench as db } from '../db/schema';

service AdminService {

  entity Users as projection on db.User;
  entity Organizations as projection on db.Organization;

}