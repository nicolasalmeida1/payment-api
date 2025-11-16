import { MercadoPagoRoutes } from '../../src/domain/enums/mercado-pago-routes.enum.js';

describe('MercadoPagoRoutes', () => {
  it('should have CREATE_PREFERENCE route', () => {
    expect(MercadoPagoRoutes.CREATE_PREFERENCE).toBe('/checkout/preferences');
  });

  it('should have GET_PREFERENCE route', () => {
    expect(MercadoPagoRoutes.GET_PREFERENCE).toBe('/checkout/preferences');
  });

  it('should have GET_PAYMENT route', () => {
    expect(MercadoPagoRoutes.GET_PAYMENT).toBe('/v1/payments');
  });

  it('should be frozen', () => {
    expect(Object.isFrozen(MercadoPagoRoutes)).toBe(true);
  });

  it('should not allow modifications', () => {
    expect(() => {
      MercadoPagoRoutes.CREATE_PREFERENCE = '/new/route';
    }).toThrow();
  });
});
