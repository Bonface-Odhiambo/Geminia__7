import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../services/admin.service';
import { ChartComponent } from '../../components/chart/chart.component';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    standalone: true,
    imports: [CommonModule, ChartComponent]
})
export class DashboardComponent implements OnInit {
    metrics = {
        totalUsers: 0,
        totalQuotes: 0,
        totalPremiums: 0,
        totalTransactions: 0,
        activeUsers: 0,
        pendingTransactions: 0
    };

    trafficData: any[] = [];
    salesData: any[] = [];
    productData: any[] = [];
    recentTransactions: any[] = [];
    isLoading = true;

    constructor(private adminService: AdminService) {}

    ngOnInit(): void {
        this.loadDashboardData();
    }

    loadDashboardData(): void {
        this.isLoading = true;
        
        // Load dashboard metrics
        this.adminService.getDashboardMetrics().subscribe({
            next: (data) => {
                this.metrics = data;
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading dashboard metrics:', err);
                this.isLoading = false;
                // Use mock data for demonstration
                this.loadMockData();
            }
        });

        // Load traffic data
        this.adminService.getWebsiteTraffic().subscribe({
            next: (data) => {
                this.trafficData = data;
            },
            error: (err) => {
                console.error('Error loading traffic data:', err);
            }
        });

        // Load sales analytics
        this.adminService.getSalesAnalytics('month').subscribe({
            next: (data) => {
                this.salesData = data;
            },
            error: (err) => {
                console.error('Error loading sales data:', err);
            }
        });

        // Load product analytics
        this.adminService.getProductAnalytics().subscribe({
            next: (data) => {
                this.productData = data;
            },
            error: (err) => {
                console.error('Error loading product data:', err);
            }
        });

        // Load recent transactions
        this.adminService.getAllTransactions(0, 5).subscribe({
            next: (data) => {
                this.recentTransactions = data.pageItems || [];
            },
            error: (err) => {
                console.error('Error loading transactions:', err);
            }
        });
    }

    loadMockData(): void {
        // Mock data for demonstration
        this.metrics = {
            totalUsers: 1247,
            totalQuotes: 3856,
            totalPremiums: 12500000,
            totalTransactions: 2341,
            activeUsers: 892,
            pendingTransactions: 45
        };

        this.recentTransactions = [
            { id: 1, user: 'John Doe', amount: 45000, product: 'Marine Cargo', status: 'Completed', date: '2025-10-07' },
            { id: 2, user: 'Jane Smith', amount: 12000, product: 'Travel Insurance', status: 'Pending', date: '2025-10-07' },
            { id: 3, user: 'Bob Johnson', amount: 78000, product: 'Marine Cargo', status: 'Completed', date: '2025-10-06' },
            { id: 4, user: 'Alice Brown', amount: 23000, product: 'Travel Insurance', status: 'Completed', date: '2025-10-06' },
            { id: 5, user: 'Charlie Wilson', amount: 56000, product: 'Marine Cargo', status: 'Failed', date: '2025-10-05' }
        ];
    }

    getStatusClass(status: string): string {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'failed':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }
}
