import { Model } from 'objection';

export default class Payment extends Model {
  static get tableName() {
    return 'payment';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      history: {
        relation: Model.HasManyRelation,
        modelClass: () => import('./payment-history.js'),
        join: {
          from: 'payment_id',
          to: 'payment_history.payment_id',
        },
      },
    };
  }
}
