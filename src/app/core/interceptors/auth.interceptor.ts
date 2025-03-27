import { HttpInterceptorFn } from "@angular/common/http"
import { inject } from "@angular/core"
import { AuthService } from "../services/auth.service"

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log('Interceptor called for URL:', req.url);
  const authService = inject(AuthService)
  const token = authService.getToken()
  console.log('Token in interceptor:', token);

  if (token) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
    console.log('Request headers:', clonedReq.headers.get('Authorization'));
    return next(clonedReq)
  }
  return next(req)
}