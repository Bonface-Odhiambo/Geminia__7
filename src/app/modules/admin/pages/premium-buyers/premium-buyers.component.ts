import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
    selector: 'app-premium-buyers',
    templateUrl: './premium-buyers.component.html',
    standalone: true,
    imports: [CommonModule, FormsModule]
})
export class PremiumBuyersComponent implements OnInit {
    premiumBuyers: any[] = [];
    isLoading = true;
    filterProduct = '';
    currentPage = 0;
    pageSize = 20;

    constructor(private adminService: AdminService) {}

    ngOnInit(): void {
        this.loadPremiumBuyers();
    }

    loadPremiumBuyers(): void {
        this.isLoading = true;
        this.adminService.getPremiumBuyers(this.currentPage * this.pageSize, this.pageSize, this.filterProduct).subscribe({
            next: (data) => {
                this.premiumBuyers = data.pageItems || [];
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Error loading premium buyers:', err);
                this.isLoading = false;
                this.loadMockPremiumBuyers();
            }
        });
    }

    loadMockPremiumBuyers(): void {
        this.premiumBuyers = [
            { id: 1, name: 'John Doe', email: 'john@example.com', phone: '0712345678', product: 'Marine Cargo', policyRef: 'POL-001', premium: 45000, sumInsured: 5000000, status: 'Active', purchaseDate: '2025-10-07' },
            { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '0723456789', product: 'Travel Insurance', policyRef: 'POL-002', premium: 12000, sumInsured: 150000, status: 'Active', purchaseDate: '2025-10-07' },
            { id: 3, name: 'Bob Johnson', email: 'bob@example.com', phone: '0734567890', product: 'Marine Cargo', policyRef: 'POL-003', premium: 78000, sumInsured: 8000000, status: 'Active', purchaseDate: '2025-10-06' },
            { id: 4, name: 'Alice Brown', email: 'alice@example.com', phone: '0745678901', product: 'Travel Insurance', policyRef: 'POL-004', premium: 23000, sumInsured: 200000, status: 'Expired', purchaseDate: '2025-09-15' },
            { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', phone: '0756789012', product: 'Marine Cargo', policyRef: 'POL-005', premium: 56000, sumInsured: 3500000, status: 'Active', purchaseDate: '2025-10-05' }
        ];
    }

    onFilterChange(): void {
        this.currentPage = 0;
        this.loadPremiumBuyers();
    }

    getStatusClass(status: string): string {
        switch (status.toLowerCase()) {
            case 'active':
                return 'bg-green-100 text-green-800';
            case 'expired':
                return 'bg-red-100 text-red-800';
            case 'cancelled':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    }

    getProductClass(product: string): string {
        return product.includes('Marine') ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800';
    }
}
