import { Controller } from "@ajs/api/beta";
import {
  DataController,
  DefaultRoutes,
  RegisterDataController,
} from "@ajs/data-api/beta";
import {
  Access,
  AccessMode,
  Listable,
  Mandatory,
  ModelReference,
  Sortable,
} from "@ajs/data-api/beta/metadata";
import { Model } from "@ajs/database-decorators/beta";
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
