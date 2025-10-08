import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { AuthService } from 'app/core/auth/auth.service';

@Component({
    selector: 'app-admin-layout',
    templateUrl: './layout.component.html',
    standalone: true,
    imports: [CommonModule, RouterModule, SidebarComponent]
})
export class AdminLayoutComponent implements OnInit {
    adminUser: any = null;

    constructor(
        private authService: AuthService,
        private router: Router
    ) {}

    ngOnInit(): void {
        // Get current admin user data
        this.adminUser = this.authService.getAdminUser();
    }

    logout(): void {
        console.log('🚪 Admin logout initiated');
        this.authService.signOut();
        this.router.navigate(['/sign-in'], { replaceUrl: true });
    }
}
