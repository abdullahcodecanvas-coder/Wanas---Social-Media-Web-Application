
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/auth/Services/auth.service';
import Swal from 'sweetalert2';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [RouterLink, RouterLinkActive, ReactiveFormsModule, NgClass],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent{

   private readonly authService = inject(AuthService)
  private readonly router = inject(Router)
  
  Notloading =signal(true)
  isloading =signal(false)
  LoginForm: FormGroup = new FormGroup({
  
email: new FormControl("", [
  Validators.required,
  Validators.pattern("^[A-Za-z0-9._%+\\-]+@[A-Za-z0-9\\-]+(?:\\.[A-Za-z0-9\\-]+)*\\.com$")
]),    
    password:new FormControl("",[Validators.required,Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#_\\-])[A-Za-z\\d@$!%*?&#_\\-]{8,64}$")]),


  });

   onSubmit():void{
   if( this.LoginForm.valid ){

     this.Notloading.set(false)
   this.isloading.set(true)
     this.authService.sinIn(this.LoginForm.value).subscribe({
      next:(res)=>{

      if(res.success){
         localStorage.setItem('token', res.data.token);

    localStorage.setItem(
      'user',
      JSON.stringify(res.data.user)
    );

        this.router.navigate(['/feed'])
      } 
      },error: (err) => {
  const msg: string = err?.error?.error || err?.error?.message || '';

  Swal.fire({
    icon: 'error',
    title: err.status === 401 ? 'Login failed' : 'Something went wrong',
    text: err.status === 401
      ? 'Incorrect email or password.'
      : (msg || 'Please try again later.'),
    confirmButtonColor: '#E8710A',
  });

  this.Notloading.set(true);
  this.isloading.set(false);
},
    })
  }else{
   this.LoginForm.markAllAsTouched();
   }
}

/* Show Password  And  Hiden */ 
Spassword = false
showPassword(){
  this.Spassword = !this.Spassword
}

}