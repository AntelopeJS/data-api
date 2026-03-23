import { Controller } from "@antelopejs/interface-api";
import {
  DataController,
  DefaultRoutes,
  RegisterDataController,
} from "@antelopejs/interface-data-api";
import {
  Access,
  AccessMode,
  Listable,
  Mandatory,
  ModelReference,
  Sortable,
} from "@antelopejs/interface-data-api/metadata";
import { Model } from "@antelopejs/interface-database-decorators";
import { User, UserModel } from "../db/user";

const routes = {
  get: DefaultRoutes.Get,
  list: DefaultRoutes.List,
  new: DefaultRoutes.New,
  edit: DefaultRoutes.Edit,
  delete: DefaultRoutes.Delete,
};

@RegisterDataController()
export class UserDataAPI extends DataController(
  User,
  routes,
  Controller("/users"),
) {
  @ModelReference()
  @Model(UserModel, "default")
  declare userModel: UserModel;

  @Listable()
  @Sortable()
  @Access(AccessMode.ReadOnly)
  declare _id: string;

  @Listable()
  @Sortable()
  @Mandatory("new", "edit")
  @Access(AccessMode.ReadWrite)
  declare email: string;

  @Listable()
  @Sortable()
  @Mandatory("new", "edit")
  @Access(AccessMode.ReadWrite)
  declare firstName: string;

  @Listable()
  @Sortable()
  @Mandatory("new", "edit")
  @Access(AccessMode.ReadWrite)
  declare lastName: string;
}
