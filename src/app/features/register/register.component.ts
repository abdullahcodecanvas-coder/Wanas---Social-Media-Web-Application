
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import {
  ReactiveFormsModule,
  FormGroup,
  FormControl,
  Validators,
  AbstractControl
} from '@angular/forms';
import { AuthService } from '../../core/auth/Services/auth.service';
import Swal from 'sweetalert2';
import { NgClass } from '@angular/common';
import { validate } from '@angular/forms/signals';

@Component({
  selector: 'app-register',
  imports: [RouterLink, RouterLinkActive, ReactiveFormsModule, NgClass],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router)
  
  messageError=signal(""); 
  isloading = signal(false);
  Notloading = signal(true);
  RegisterForm: FormGroup = new FormGroup({
    name: new FormControl("", [
  Validators.required,
  Validators.pattern(/^[\p{L}\p{M}]+(?:[ '\-][\p{L}\p{M}]+)+$/u),
]),
username: new FormControl("", [

  Validators.required,
  Validators.pattern(/^[a-z0-9_]{3,30}$/)
]),
email: new FormControl("", [
  Validators.required,
  Validators.pattern("^[A-Za-z0-9._%+\\-]+@[A-Za-z0-9\\-]+(?:\\.[A-Za-z0-9\\-]+)*\\.com$")
]),    dateOfBirth:new FormControl("",[Validators.required,Validators.pattern("^(19[5-9][0-9]|200[0-9]|201[0-9]|2020)-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$")]),
    gender:new FormControl("male",Validators.required),

    password:new FormControl("",[Validators.required,Validators.pattern("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&#_\\-])[A-Za-z\\d@$!%*?&#_\\-]{8,64}$")]),

    rePassword:new FormControl("",[Validators.required]),
    term:new FormControl(false,[Validators.requiredTrue]),

  },{ validators:this.consfirmPassword } );
 
  RegisterFormSubmitted = false;
   onSubmit():void{
   if( this.RegisterForm.valid ){
     this.RegisterFormSubmitted = true;
  
     this.isloading.set(true)
     this.Notloading.set(false)

   const { term, ...userData } = this.RegisterForm.value;
   console.log(this.RegisterForm.value)
   localStorage.setItem("gender" , this.RegisterForm.value.gender )
     this.authService.sinUp(userData).subscribe({
      next:(res)=>{
        
    localStorage.setItem("token" , res.data.token  ) 
    localStorage.setItem("user" , JSON.stringify(res.data.user ) ) 
      if(res.success){
      Swal.fire({
        icon: 'success',
        title: 'Welcome to Wanas! 🎉',
        text: 'Your account has been created successfully.',
        confirmButtonText: 'Go to Login',
        confirmButtonColor: '#E8710A',
      }).then(() => this.router.navigate(['/login']));
      }
   
      },
      error: (err) => {
       
      const msg: string = err?.error?.error || err?.error?.message || '';
      const exists =
        err.status === 409 || /already exist/i.test(msg);

      if (exists) {
        Swal.fire({
          icon: 'warning',
          title: 'Account already exists',
          text: 'This email is already registered. Would you like to log in instead?',
          showCancelButton: true,
          confirmButtonText: 'Go to Login',
          cancelButtonText: 'Try another email',
          confirmButtonColor: '#E8710A',
          cancelButtonColor: '#6B4A3A',
          reverseButtons: true,
        }).then((result) => {
          if (result.isConfirmed) this.router.navigate(['/login']);
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Something went wrong',
          text: msg || 'Please try again later.',
          confirmButtonColor: '#E8710A',
        });
      }
       this.isloading.set(false)
     this.Notloading.set(true)
    }
     })
   }else{
    this.RegisterForm.markAllAsTouched();
   }
   }

/*  Show Terms in Html  */  
 get fullPassword(){
  return this.RegisterForm.get('password');
 }
 get string(){
  const value = this.fullPassword?.value || "";
  if(!value){
    return{ score:0 ,  label: 'Empty'  , color: '#ece6dc', width: '0%'  }
  }
  const checks = [
  /[a-z]/.test(value),
  /[A-Z]/.test(value),
  /\d/.test(value),
  /[@$!%*?&#_\-]/.test(value),
  value.length >= 8,
];
const score = checks.filter(Boolean).length;
const levels = [
  { label: 'Very Weak', color: '#ef4444', width: '20%' },   // index 0
  { label: 'Weak',      color: '#f97316', width: '40%' },   // index 1
  { label: 'Fair',      color: '#eab308', width: '60%' },   // index 2
  { label: 'Good',      color: '#84cc16', width: '80%' },   // index 3
  { label: 'Strong',    color: '#22c55e', width: '100%' },  // index 4
];
return { score, ...levels[score - 1] ?? levels[0] };
 }

 showPassword = false ;
 showRePassword = false ;
togglePassword(){
  this.showPassword = !this.showPassword
}
toggleRePassword(){
  this.showRePassword = !this.showRePassword
}
/*
Confirm RePassword
*/ 
consfirmPassword(group:AbstractControl){
const Password = group.get('password')?.value ; 
const RePassword = group.get('rePassword')?.value ; 
if(Password !== RePassword){
return {mistach: true}
}else{
  return null;
}
}


}
