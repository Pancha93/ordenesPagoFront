import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { LoginRequest, AuthResponse, CurrentUser, UserRole } from '../models/user.model';
import { environment } from '../config/environment';

/**
 * Tests unitarios para AuthService.
 * Prueba la lógica de autenticación sin involucrar el DOM.
 */
describe('AuthService - Logic Tests (No DOM)', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  beforeEach(() => {
    // Mock del Router
    const routerMock = jasmine.createSpyObj('Router', ['navigate']);

    // Mock de localStorage
    let store: { [key: string]: string } = {};
    const mockLocalStorage = {
      getItem: (key: string): string | null => {
        return key in store ? store[key] : null;
      },
      setItem: (key: string, value: string): void => {
        store[key] = value;
      },
      removeItem: (key: string): void => {
        delete store[key];
      },
      clear: (): void => {
        store = {};
      }
    };

    spyOn(localStorage, 'getItem').and.callFake(mockLocalStorage.getItem);
    spyOn(localStorage, 'setItem').and.callFake(mockLocalStorage.setItem);
    spyOn(localStorage, 'removeItem').and.callFake(mockLocalStorage.removeItem);
    spyOn(localStorage, 'clear').and.callFake(mockLocalStorage.clear);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerMock }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  describe('Login', () => {
    it('debe realizar login exitoso y guardar datos en localStorage', (done) => {
      const loginRequest: LoginRequest = {
        email: 'admin@vortexbird.com',
        password: 'password123'
      };

      const mockResponse: AuthResponse = {
        token: 'mock-jwt-token-12345',
        tokenType: 'Bearer',
        email: 'admin@vortexbird.com',
        fullName: 'Admin User',
        role: UserRole.ADMIN,
        expiresIn: 3600000
      };

      service.login(loginRequest).subscribe({
        next: (response) => {
          expect(response).toEqual(mockResponse);
          expect(localStorage.setItem).toHaveBeenCalledWith('auth_token', mockResponse.token);
          expect(localStorage.setItem).toHaveBeenCalledWith('current_user', jasmine.any(String));
          
          const currentUser = service.getCurrentUser();
          expect(currentUser).toBeTruthy();
          expect(currentUser?.email).toBe('admin@vortexbird.com');
          expect(currentUser?.role).toBe(UserRole.ADMIN);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(loginRequest);
      req.flush(mockResponse);
    });

    it('debe manejar error de login con credenciales inválidas', (done) => {
      const loginRequest: LoginRequest = {
        email: 'admin@vortexbird.com',
        password: 'wrong-password'
      };

      service.login(loginRequest).subscribe({
        next: () => done.fail('Expected error'),
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error.status).toBe(401);
          done();
        }
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush({ message: 'Invalid credentials' }, { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('Logout', () => {
    it('debe limpiar localStorage y navegar a /login', () => {
      // Simular sesión activa
      localStorage.setItem('auth_token', 'token123');
      localStorage.setItem('current_user', JSON.stringify({
        email: 'test@test.com',
        fullName: 'Test User',
        role: 'OPERATOR',
        token: 'token123'
      }));

      service.logout();

      expect(localStorage.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('current_user');
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
      expect(service.getCurrentUser()).toBeNull();
    });
  });

  describe('Verificaciones de estado', () => {
    it('isAuthenticated() debe retornar true cuando hay token', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue('token123');
      expect(service.isAuthenticated()).toBe(true);
    });

    it('isAuthenticated() debe retornar false cuando no hay token', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);
      expect(service.isAuthenticated()).toBe(false);
    });

    it('getToken() debe retornar el token almacenado', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue('token-abc-123');
      expect(service.getToken()).toBe('token-abc-123');
    });

    it('getToken() debe retornar null si no hay token', () => {
      (localStorage.getItem as jasmine.Spy).and.returnValue(null);
      expect(service.getToken()).toBeNull();
    });
  });

  describe('CurrentUser Observable', () => {
    it('debe emitir el usuario actual después del login', (done) => {
      const mockResponse: AuthResponse = {
        token: 'token123',
        tokenType: 'Bearer',
        email: 'operator@test.com',
        fullName: 'Operator User',
        role: UserRole.OPERATOR,
        expiresIn: 3600000
      };

      service.currentUser$.subscribe({
        next: (user) => {
          if (user) {
            expect(user.email).toBe('operator@test.com');
            expect(user.role).toBe('OPERATOR');
            done();
          }
        }
      });

      service.login({ email: 'operator@test.com', password: 'pass' }).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
      req.flush(mockResponse);
    });

    it('debe emitir null después del logout', (done) => {
      // Primero hacer login
      localStorage.setItem('auth_token', 'token123');
      localStorage.setItem('current_user', JSON.stringify({
        email: 'test@test.com',
        fullName: 'Test',
        role: 'OPERATOR',
        token: 'token123'
      }));

      let emissionCount = 0;
      service.currentUser$.subscribe({
        next: (user) => {
          emissionCount++;
          if (emissionCount === 1) {
            // Después de logout debe ser null
            service.logout();
          } else if (emissionCount === 2) {
            expect(user).toBeNull();
            done();
          }
        }
      });
    });
  });
});
