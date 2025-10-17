import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {AuthService} from '../auth.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.createFormGroup();
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    const { user, password } = this.form.value;

    this.authService.login(user, password).subscribe({
      next: (res) => {
        localStorage.setItem('auth_token', res.access_token);
        localStorage.setItem('current_user', JSON.stringify(res.user));
        this.authService.isAuthenticated.set(true);

        console.log('role: ', res.user.role);
        if(res.user.role === 'ADMIN') {
          console.log('navigate admin');
          this.router.navigate(['/admin']);
        } else {
          console.log('navigate shop');
          this.router.navigate(['/shop']);
        }
      },
      error: (err) => alert('Błędne dane logowania')
    });
  }

  private createFormGroup(): void {
    this.form = this.fb.group({
      user: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }
}
