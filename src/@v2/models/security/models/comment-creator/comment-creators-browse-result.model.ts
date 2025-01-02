export type ICommentCreatorBrowseResultModel = {
  id: number;
  name: string;
  email: string;
};

export class CommentCreatorBrowseResultModel {
  id: number;
  name: string;
  email: string;

  constructor(params: ICommentCreatorBrowseResultModel) {
    this.id = params.id;
    this.name = params.name;
    this.email = params.email;
  }
}
