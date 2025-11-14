import { Model } from 'objection';

export default class PaymentHistory extends Model {
  static get tableName() {
    return 'payment_history';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      payment: {
        relation: Model.BelongsToOneRelation,
        modelClass: () => import('./payment.js'),
        join: {
          from: 'payment_history.payment_id',
          to: 'payment_id',
        },
      },
    };
  }
}
