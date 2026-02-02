import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from '../../../common/services/configuration.service';
import { AuthService } from '../../../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'] 
})
export class AdminComponent implements OnInit {
  private apiUrl = ConfigurationService.getApiUrl() + '/discounts';
  
  codes: any[] = [];
  
  // Model formularza
  newCode = {
    code: '',
    percent: 100,
    maxUsages: 1
  };

  isLoading = false;

  constructor(
    private http: HttpClient, 
    private auth: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadCodes();
  }

  loadCodes() {
    this.http.get<any[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.codes = data;
        this.cdr.detectChanges(); // 👈 Wymuszamy odświeżenie widoku!
      },
      error: (err) => console.error('Błąd pobierania kodów:', err)
    });
  }

  generateCode() {
    if (!this.newCode.code) return;
    this.isLoading = true;

    this.http.post(this.apiUrl, this.newCode).subscribe({
      next: () => {
        alert('✅ Kod utworzony!');
        this.loadCodes(); // Odśwież listę
        this.isLoading = false;
        // Reset formularza (opcjonalnie)
        this.newCode.code = ''; 
      },
      error: (err) => {
        alert('❌ Błąd: ' + (err.error?.message || err.message));
        this.isLoading = false;
      }
    });
  }

  toggleStatus(code: any) {
    this.http.patch(`${this.apiUrl}/${code.id}/status`, {}).subscribe({
      next: () => {
        this.loadCodes(); // Przeładuj listę
      },
      error: (err) => alert('Błąd zmiany statusu: ' + err.message)
    });
  }

  deleteCode(code: any) {
    if (!confirm(`Czy na pewno usunąć kod ${code.code}?`)) return;

    this.http.delete(`${this.apiUrl}/${code.id}`).subscribe({
      next: () => {
        this.loadCodes(); // Przeładuj listę
      },
      error: (err) => alert('Błąd usuwania: ' + err.message)
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}