import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';

@Component({
    selector: 'app-admin-layout',
    templateUrl: './layout.component.html',
    standalone: true,
    imports: [CommonModule, RouterModule, SidebarComponent]
})
export class AdminLayoutComponent {}
