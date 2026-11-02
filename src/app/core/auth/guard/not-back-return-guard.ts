import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const notBackReturnGuard: CanActivateFn = (route, state) => {
  const router = inject(Router)
    if(localStorage.getItem("token")){
return router.parseUrl('/feed')
    
    }else{
    return true;
    }
  // route ----> information About Routing
  //state  ------> path include now
  
};
