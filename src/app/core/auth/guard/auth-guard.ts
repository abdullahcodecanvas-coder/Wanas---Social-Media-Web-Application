import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
     const router = inject(Router)
    if(localStorage.getItem("token")){
    return true;
    }else{
    return router.parseUrl('/login')
    }
  // route ----> information About Routing
  //state  ------> path include now
  
};
