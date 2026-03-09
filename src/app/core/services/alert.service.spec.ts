import { TestBed } from '@angular/core/testing';
import { AlertService } from './alert.service';
import Swal from 'sweetalert2';

/**
 * Tests unitarios para AlertService.
 * Prueba la lógica del servicio verificando que se llamen
 * los métodos de SweetAlert2 correctamente.
 */
describe('AlertService - Logic Tests (No DOM)', () => {
  let service: AlertService;
  let swalFireSpy: jasmine.Spy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AlertService]
    });

    service = TestBed.inject(AlertService);
    
    // Spy en Swal.fire para no mostrar alertas reales durante los tests
    swalFireSpy = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({
      isConfirmed: true,
      isDenied: false,
      isDismissed: false,
      value: true
    } as any));
  });

  describe('success', () => {
    it('debe llamar a Swal.fire con configuración de éxito', async () => {
      await service.success('Operación exitosa', 'Todo salió bien');

      expect(swalFireSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          icon: 'success',
          title: 'Operación exitosa',
          text: 'Todo salió bien',
          confirmButtonColor: '#667eea',
          confirmButtonText: 'Aceptar',
          timer: 3000,
          timerProgressBar: true
        })
      );
    });

    it('debe funcionar sin mensaje opcional', async () => {
      await service.success('¡Éxito!');

      expect(swalFireSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          icon: 'success',
          title: '¡Éxito!'
        })
      );
    });
  });

  describe('error', () => {
    it('debe llamar a Swal.fire con configuración de error', async () => {
      await service.error('Error crítico', 'Algo salió mal');

      expect(swalFireSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          icon: 'error',
          title: 'Error crítico',
          text: 'Algo salió mal',
          confirmButtonColor: '#667eea',
          confirmButtonText: 'Aceptar'
        })
      );
    });

    it('debe manejar errores sin mensaje de detalle', async () => {
      await service.error('Error');

      expect(swalFireSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          icon: 'error',
          title: 'Error'
        })
      );
    });
  });

  describe('warning', () => {
    it('debe llamar a Swal.fire con configuración de advertencia', async () => {
      await service.warning('Advertencia', 'Ten cuidado');

      expect(swalFireSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          icon: 'warning',
          title: 'Advertencia',
          text: 'Ten cuidado',
          confirmButtonColor: '#667eea',
          confirmButtonText: 'Aceptar'
        })
      );
    });
  });

  describe('info', () => {
    it('debe llamar a Swal.fire con configuración informativa', async () => {
      await service.info('Información', 'Datos importantes');

      expect(swalFireSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          icon: 'info',
          title: 'Información',
          text: 'Datos importantes',
          confirmButtonColor: '#667eea',
          confirmButtonText: 'Aceptar'
        })
      );
    });
  });

  describe('confirm', () => {
    it('debe llamar a Swal.fire con configuración de confirmación', async () => {
      await service.confirm(
        '¿Estás seguro?',
        'Esta acción no se puede deshacer',
        'Sí, continuar'
      );

      expect(swalFireSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          icon: 'question',
          title: '¿Estás seguro?',
          text: 'Esta acción no se puede deshacer',
          showCancelButton: true,
          confirmButtonColor: '#667eea',
          cancelButtonColor: '#95a5a6',
          confirmButtonText: 'Sí, continuar',
          cancelButtonText: 'Cancelar'
        })
      );
    });

    it('debe usar texto por defecto para confirmación', async () => {
      await service.confirm('Confirmar acción');

      expect(swalFireSpy).toHaveBeenCalledWith(
        jasmine.objectContaining({
          icon: 'question',
          title: 'Confirmar acción',
          showCancelButton: true,
          confirmButtonText: 'Sí, confirmar'
        })
      );
    });

    it('debe retornar el resultado de la confirmación', async () => {
      swalFireSpy.and.returnValue(Promise.resolve({
        isConfirmed: true,
        isDenied: false,
        isDismissed: false,
        value: true
      } as any));

      const result = await service.confirm('Test');
      
      expect(result.isConfirmed).toBe(true);
    });
  });

  describe('Integración entre métodos', () => {
    it('debe poder llamar múltiples alertas en secuencia', async () => {
      await service.success('Paso 1');
      await service.info('Paso 2');
      await service.warning('Paso 3');

      expect(swalFireSpy).toHaveBeenCalledTimes(3);
      expect(swalFireSpy.calls.argsFor(0)[0]).toEqual(jasmine.objectContaining({ icon: 'success' }));
      expect(swalFireSpy.calls.argsFor(1)[0]).toEqual(jasmine.objectContaining({ icon: 'info' }));
      expect(swalFireSpy.calls.argsFor(2)[0]).toEqual(jasmine.objectContaining({ icon: 'warning' }));
    });
  });
});
