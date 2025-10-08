import { Component, OnInit, OnDestroy, Inject, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { Subject, ReplaySubject, EMPTY } from 'rxjs';
import { take, takeUntil, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { UserService } from 'app/core/user/user.service';
import { QuoteService } from '../shared/services/quote.service';
import { ThousandsSeparatorValueAccessor } from '../directives/thousands-separator-value-accessor';

export interface MarineBuyNowData {
    quoteId: string;
}

@Component({
    selector: 'app-marine-buy-now-modal',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatIconModule,
        MatSnackBarModule,
        MatSelectModule,
        MatRadioModule,
        MatCheckboxModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatAutocompleteModule,
        NgxMatSelectSearchModule,
        ThousandsSeparatorValueAccessor
    ],
    templateUrl: './marine-buy-now-modal.component.html',
    styles: [`
        :host {
            --primary-color: #21275c; /* Pantone 2758 C */
            --secondary-color: #04b2e1; /* Pantone 306 C */
            --accent-color: #f36f21; /* Pantone 158 C */
            --text-primary: #333;
            --text-secondary: #666;
            --bg-light: #f8f9fa;
            --border-color: #e9ecef;
        }

        .modal-container {
          display: flex;
          flex-direction: column;
          height: 100%;
          width: 100%;
          overflow: hidden;
          position: relative;
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px 24px;
          background-color: var(--primary-color);
          color: white;
          position: relative;
          flex-shrink: 0;
          width: 100%;
        }

        .modal-title {
          color: white;
          font-size: 20px;
          font-weight: 600;
          margin: 0;
          text-align: center;
        }

        .close-button {
          position: absolute;
          top: 8px;
          right: 8px;
          color: white;
        }

        .modal-content {
          flex: 1;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          position: relative;
        }

        /* Ensure content starts from the top */
        .modal-content > div {
          display: flex;
          flex-direction: column;
        }

        /* Grid container should not restrict height on desktop */
        .max-w-full.mx-auto.h-full {
          height: auto !important;
          min-height: 100%;
        }

        /* Main grid should allow content to flow naturally */
        .grid.grid-cols-1.lg\\:grid-cols-12 {
          height: auto !important;
          min-height: 100%;
        }

        /* Form section should scroll independently */
        .lg\\:col-span-2.overflow-y-auto {
          max-height: calc(93vh - 100px);
          overflow-y: auto;
        }

        /* Payment section should have proper height on desktop */
        @media (min-width: 1024px) {
          /* Payment section - no scrollbar, show all content */
          .lg\\:col-span-5 .bg-white.rounded-lg.shadow-sm {
            height: auto !important;
            max-height: none !important;
            overflow-y: visible !important;
          }

          /* Ensure form section starts from top */
          .lg\\:col-span-7.overflow-y-auto {
            align-self: flex-start;
          }

          .lg\\:col-span-5 {
            align-self: flex-start;
          }

          /* Compact payment section spacing */
          .lg\\:col-span-5 .bg-white.rounded-lg.shadow-sm {
            padding: 0.5rem !important;
          }

          .lg\\:col-span-5 h2 {
            font-size: 1rem !important;
            margin-bottom: 0.5rem !important;
          }

          .lg\\:col-span-5 .mb-2 {
            margin-bottom: 0.5rem !important;
          }

          .lg\\:col-span-5 .pb-2 {
            padding-bottom: 0.5rem !important;
          }

          .lg\\:col-span-5 .space-y-1 > * + * {
            margin-top: 0.25rem !important;
          }

          /* Reduce M-Pesa logo size */
          .lg\\:col-span-5 img {
            height: 1.5rem !important;
          }

          .lg\\:col-span-5 .border-gray-200.rounded-xl {
            padding: 0.25rem 0.75rem !important;
          }

          /* Make payment section sticky so it stays visible while scrolling form */
          .lg\\:col-span-5 {
            position: sticky;
            top: 0;
          }
        }

        /* Smooth scrolling */
        .overflow-y-auto {
          scroll-behavior: smooth;
          -webkit-overflow-scrolling: touch;
        }

        /* Custom scrollbar for better UX */
        .overflow-y-auto::-webkit-scrollbar {
          width: 8px;
        }

        .overflow-y-auto::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb {
          background: #888;
          border-radius: 4px;
        }

        .overflow-y-auto::-webkit-scrollbar-thumb:hover {
          background: #555;
        }

        /* Compact form fields */
        ::ng-deep .mat-mdc-form-field {
          margin-bottom: 0.25rem !important;
        }

        ::ng-deep .mat-mdc-text-field-wrapper {
          padding-bottom: 0 !important;
        }

        ::ng-deep .mdc-text-field {
          padding: 4px 8px !important;
        }

        ::ng-deep .mat-mdc-form-field-infix {
          min-height: 32px !important;
          padding-top: 4px !important;
          padding-bottom: 4px !important;
        }

        ::ng-deep .mat-mdc-floating-label {
          top: 16px !important;
        }

        /* Additional compact styles */
        .recalculation-notice {
            background-color: #eef2ff;
            color: #4338ca;
            padding: 6px 10px;
            border-radius: 6px;
            margin-bottom: 0.5rem;
            font-size: 0.7rem;
            display: flex;
            align-items: center;
        }

        .recalculation-notice mat-icon {
            margin-right: 4px;
            font-size: 16px;
            width: 16px;
            height: 16px;
        }

        /* Compact section headers */
        h2 {
            font-size: 0.875rem !important;
            margin-bottom: 0.75rem !important;
            margin-top: 0 !important;
            padding-top: 0.5rem;
            border-top: 1px solid #e5e7eb;
        }

        h2:first-of-type {
            border-top: none;
            padding-top: 0;
        }

        /* Compact file upload areas */
        .border-dashed {
            padding: 8px !important;
        }

        /* Compact radio buttons */
        ::ng-deep .mat-mdc-radio-button {
            margin-right: 12px !important;
        }

        ::ng-deep .mat-mdc-form-field-hint-wrapper,
        ::ng-deep .mat-mdc-form-field-error-wrapper {
          padding: 0 !important;
        }

        .disabled-section {
            position: relative;
            pointer-events: none;
            opacity: 0.5;
        }

        /* Section spacing */
        .mb-3 {
            margin-bottom: 1rem !important;
        }

        .mt-4 {
            margin-top: 1.5rem !important;
        }

        /* Mobile Responsive Styles */
        @media (max-width: 1023px) {
            .modal-content {
                overflow-y: auto !important;
            }

            .grid {
                display: flex !important;
                flex-direction: column !important;
            }

            .order-1 {
                order: 1 !important;
            }

            .order-2 {
                order: 2 !important;
                margin-top: 1rem !important;
            }

            .overflow-y-auto {
                overflow-y: visible !important;
                max-height: none !important;
            }

            /* Ensure payment section is not sticky on mobile */
            .lg\\:h-full {
                height: auto !important;
            }

            /* Adjust modal header for mobile */
            .modal-title {
                font-size: 18px !important;
            }

            /* Adjust padding for mobile */
            .modal-content {
                padding: 0.5rem !important;
            }

            .bg-white.rounded-lg.shadow-sm {
                padding: 1rem !important;
            }

            /* Make form fields stack properly on mobile */
            .grid.grid-cols-1.md\\:grid-cols-2 {
                display: grid !important;
                grid-template-columns: 1fr !important;
            }

            /* Adjust recalculation notice for mobile */
            .recalculation-notice {
                font-size: 0.65rem !important;
                padding: 8px !important;
            }

            .recalculation-notice mat-icon {
                font-size: 14px !important;
                width: 14px !important;
                height: 14px !important;
            }
        }

        /* Tablet Responsive Styles */
        @media (min-width: 768px) and (max-width: 1023px) {
            .grid.grid-cols-1.md\\:grid-cols-2 {
                grid-template-columns: repeat(2, 1fr) !important;
            }
        }

        /* Small Mobile Devices */
        @media (max-width: 640px) {
            .modal-header {
                padding: 12px 16px !important;
            }

            .modal-title {
                font-size: 16px !important;
            }

            h2 {
                font-size: 0.8rem !important;
            }

            /* Adjust file upload areas for small screens */
            .border-dashed {
                padding: 6px !important;
            }

            .border-dashed button {
                font-size: 0.75rem !important;
            }

            .border-dashed p {
                font-size: 0.65rem !important;
            }

            /* Adjust form field sizes */
            ::ng-deep .mat-mdc-form-field {
                font-size: 0.875rem !important;
            }

            /* Adjust payment section spacing */
            .space-y-2 > * + * {
                margin-top: 0.5rem !important;
            }

            /* Make buttons more touch-friendly */
            button {
                min-height: 44px !important;
            }

            /* Adjust checkbox and radio button sizes */
            ::ng-deep .mat-mdc-checkbox,
            ::ng-deep .mat-mdc-radio-button {
                font-size: 0.875rem !important;
            }

            /* Improve disabled overlay on mobile */
            .disabled-overlay {
                padding: 16px !important;
                max-width: 90% !important;
            }

            .disabled-overlay mat-icon {
                font-size: 36px !important;
                width: 36px !important;
                height: 36px !important;
            }

            .disabled-overlay p {
                font-size: 12px !important;
            }
        }

        /* Landscape mobile orientation */
        @media (max-width: 1023px) and (orientation: landscape) {
            .modal-container {
                height: auto !important;
            }

            .modal-content {
                max-height: none !important;
            }
        }

        .disabled-overlay {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: rgba(255, 255, 255, 0.95);
            padding: 24px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            text-align: center;
            z-index: 10;
            pointer-events: auto;
            max-width: 400px;
        }

        .disabled-overlay mat-icon {
            font-size: 48px;
            width: 48px;
            height: 48px;
            color: #9ca3af;
            margin-bottom: 12px;
        }

        .disabled-overlay p {
            color: #6b7280;
            font-size: 14px;
            margin: 0;
            line-height: 1.5;
        }

        /* Date Picker Styling */
        ::ng-deep .mat-datepicker-toggle {
            color: var(--secondary-color) !important;
        }

        ::ng-deep .mat-datepicker-toggle-active {
            color: var(--primary-color) !important;
        }

        ::ng-deep .mat-datepicker-toggle button {
            width: 40px !important;
            height: 40px !important;
        }

        ::ng-deep .mat-datepicker-toggle mat-icon {
            font-size: 24px !important;
            width: 24px !important;
            height: 24px !important;
        }

        /* Calendar Panel Styling */
        ::ng-deep .mat-datepicker-content {
            box-shadow: 0 10px 25px rgba(33, 39, 92, 0.15) !important;
            border-radius: 12px !important;
            overflow: hidden;
        }

        ::ng-deep .mat-calendar {
            font-family: inherit;
        }

        /* Calendar Header */
        ::ng-deep .mat-calendar-header {
            background-color: var(--primary-color) !important;
            color: white !important;
            padding: 16px !important;
        }

        ::ng-deep .mat-calendar-controls {
            margin: 0 !important;
        }

        ::ng-deep .mat-calendar-period-button {
            color: white !important;
            font-weight: 600 !important;
        }

        ::ng-deep .mat-calendar-arrow {
            fill: white !important;
        }

        ::ng-deep .mat-calendar-previous-button,
        ::ng-deep .mat-calendar-next-button {
            color: white !important;
        }

        /* Calendar Body */
        ::ng-deep .mat-calendar-body-label {
            color: var(--primary-color) !important;
            font-weight: 600 !important;
            opacity: 0.7;
        }

        ::ng-deep .mat-calendar-body-cell-content {
            border-radius: 8px !important;
            transition: all 0.2s ease !important;
        }

        /* Today's date */
        ::ng-deep .mat-calendar-body-today:not(.mat-calendar-body-selected) {
            border-color: var(--secondary-color) !important;
            background-color: rgba(4, 178, 225, 0.1) !important;
        }

        /* Selected date */
        ::ng-deep .mat-calendar-body-selected {
            background-color: var(--secondary-color) !important;
            color: white !important;
            font-weight: 600 !important;
        }

        /* Hover effect */
        ::ng-deep .mat-calendar-body-cell:not(.mat-calendar-body-disabled):hover > .mat-calendar-body-cell-content:not(.mat-calendar-body-selected) {
            background-color: rgba(4, 178, 225, 0.2) !important;
        }

        /* Active/focused date */
        ::ng-deep .mat-calendar-body-active > .mat-calendar-body-cell-content:not(.mat-calendar-body-selected) {
            background-color: rgba(33, 39, 92, 0.1) !important;
        }

        /* Disabled dates */
        ::ng-deep .mat-calendar-body-disabled {
            opacity: 0.3 !important;
        }

        /* Date input field styling */
        ::ng-deep .mat-mdc-form-field.mat-focused .mat-mdc-form-field-focus-overlay {
            opacity: 0 !important;
        }

        ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__leading,
        ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__notch,
        ::ng-deep .mat-mdc-form-field.mat-focused .mdc-notched-outline__trailing {
            border-color: var(--secondary-color) !important;
        }

        /* Prevent calendar icon overlap with placeholder */
        ::ng-deep .mat-mdc-form-field-has-icon-suffix .mat-mdc-text-field-wrapper {
            padding-right: 0 !important;
        }

        ::ng-deep .mat-mdc-form-field-has-icon-suffix .mat-mdc-form-field-infix {
            padding-right: 48px !important;
        }

        ::ng-deep .mat-datepicker-toggle {
            position: absolute !important;
            right: 0 !important;
            top: 50% !important;
            transform: translateY(-50%) !important;
        }

        ::ng-deep .mat-mdc-form-field-icon-suffix {
            padding-left: 8px !important;
        }

        /* Ensure input text doesn't overlap with icon */
        ::ng-deep .mat-mdc-input-element {
            padding-right: 8px !important;
        }

        /* Month/Year view styling */
        ::ng-deep .mat-calendar-body-cell-content.mat-focus-indicator {
            border-radius: 8px !important;
        }

        ::ng-deep .mat-calendar-body-cell:not(.mat-calendar-body-disabled):hover > .mat-calendar-body-cell-content.mat-calendar-body-selected {
            background-color: var(--primary-color) !important;
        }

        /* Error Snackbar Styling */
        ::ng-deep .error-snackbar {
            background-color: #dc2626 !important;
            color: white !important;
        }

        ::ng-deep .error-snackbar .mat-mdc-snack-bar-label {
            color: white !important;
        }

        ::ng-deep .error-snackbar .mat-mdc-button {
            color: white !important;
        }

        /* Cargo Protection Card Styles */
        .cargo-protection-card {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 8px;
            padding: 12px 16px;
            transition: all 0.2s ease;
        }

        .cargo-protection-card:hover {
            border-color: #04b2e1;
            box-shadow: 0 2px 8px rgba(4, 178, 225, 0.1);
        }

        .protection-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }

        .protection-title {
            color: #6c757d;
            font-size: 12px;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .info-icon {
            color: #04b2e1;
            font-size: 16px;
            width: 16px;
            height: 16px;
            cursor: pointer;
            transition: color 0.2s ease;
        }

        .info-icon:hover {
            color: #21275c;
        }

        .protection-content {
            display: flex;
            align-items: center;
        }

        .protection-value {
            color: #212529;
            font-size: 14px;
            font-weight: 600;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        /* Pay Now Button Hover Effect */
        .pay-now-button {
            background-color: #04b2e1 !important;
            color: white !important;
            font-weight: 600 !important;
            border-radius: 8px !important;
            transition: all 0.3s ease !important;
            box-shadow: 0 4px 12px rgba(4, 178, 225, 0.3) !important;
            position: relative !important;
            overflow: hidden !important;
        }

        .pay-now-button:hover:not([disabled]) {
            background-color: #21275c !important;
            box-shadow: 0 6px 20px rgba(33, 39, 92, 0.4) !important;
            transform: translateY(-2px) !important;
        }

        .pay-now-button:active:not([disabled]) {
            transform: translateY(0) !important;
            box-shadow: 0 2px 8px rgba(33, 39, 92, 0.3) !important;
        }

        .pay-now-button[disabled] {
            opacity: 0.6 !important;
            cursor: not-allowed !important;
        }

        /* Enhanced button animation */
        .pay-now-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
            transition: left 0.5s;
        }

        .pay-now-button:hover:not([disabled])::before {
            left: 100%;
        }

        /* Responsive Design for Cargo Protection Card */
        @media (max-width: 640px) {
            .cargo-protection-card {
                padding: 10px 12px;
                margin-bottom: 16px;
            }

            .protection-title {
                font-size: 11px;
            }

            .protection-value {
                font-size: 13px;
            }

            .info-icon {
                font-size: 14px;
                width: 14px;
                height: 14px;
            }
        }

        @media (min-width: 641px) and (max-width: 1023px) {
            .cargo-protection-card {
                padding: 11px 14px;
            }

            .protection-title {
                font-size: 11.5px;
            }

            .protection-value {
                font-size: 13.5px;
            }

            .info-icon {
                font-size: 15px;
                width: 15px;
                height: 15px;
            }
        }
    `]

})
export class MarineBuyNowModalComponent implements OnInit, AfterViewInit {
    shipmentForm: FormGroup;
    isSubmitting = false;
    isLoading = true;
    premium = 0;
    tax = 0;
    total = 0;
    
    // Track duplicate file errors
    duplicateFileErrors: { [key: string]: string } = {};

    // Kenyan counties for Final Destination dropdown
    kenyanCounties: string[] = [
        'Baringo', 'Bomet', 'Bungoma', 'Busia', 'Elgeyo-Marakwet', 'Embu', 'Garissa', 'Homa Bay',
        'Isiolo', 'Kajiado', 'Kakamega', 'Kericho', 'Kiambu', 'Kilifi', 'Kirinyaga', 'Kisii',
        'Kisumu', 'Kitui', 'Kwale', 'Laikipia', 'Lamu', 'Machakos', 'Makueni', 'Mandera',
        'Marsabit', 'Meru', 'Migori', 'Mombasa', 'Murang\'a', 'Nairobi', 'Nakuru', 'Nandi',
        'Narok', 'Nyamira', 'Nyandarua', 'Nyeri', 'Samburu', 'Siaya', 'Taita-Taveta', 'Tana River',
        'Tharaka-Nithi', 'Trans Nzoia', 'Turkana', 'Uasin Gishu', 'Vihiga', 'Wajir', 'West Pokot'
    ];


    // Data sources for searchable dropdowns
    countries: any[] = [];
    loadingPorts: any[] = [];
    dischargePorts: any[] = [];
    categories: any[] = [];
    counties: any[] = [];
    cargoTypes: any[] = [];
    marineProducts: any[] = [];

    // Search controls for dropdowns
    countrySearchCtrl: FormControl = new FormControl();
    loadingPortSearchCtrl: FormControl = new FormControl();
    dischargePortSearchCtrl: FormControl = new FormControl();
    categorySearchCtrl: FormControl = new FormControl();
    countySearchCtrl: FormControl = new FormControl();
    cargoTypeSearchCtrl: FormControl = new FormControl();

    // Observable streams for filtered data
    filteredCountries: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
    filteredLoadingPorts: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
    filteredDischargePorts: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
    filteredCategories: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
    filteredCounties: ReplaySubject<string[]> = new ReplaySubject<string[]>(1);
    filteredCargoTypes: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

    // Helper method to get port display name - handles both objects and strings
    public getPortDisplayName(port: any): string {
        if (typeof port === 'string') {
            return port; // Manual entry
        }
        if (typeof port === 'object' && port) {
            return port.portname || port.pname || port.name || port.portName || 'Unknown Port';
        }
        return '';
    }

    // Helper method to get port ID - handles both objects and strings
    public getPortId(port: any): any {
        if (typeof port === 'string') {
            return port; // Manual entry
        }
        if (typeof port === 'object' && port) {
            return port.id || port.portId || port.portid;
        }
        return port;
    }

    // Pagination properties (server-side only)
    countryPage = 0;
    loadingPortPage = 0;
    dischargePortPage = 0;
    pageSize = 50;
    
    // Loading states
    isLoadingCountries = false;
    isLoadingLoadingPorts = false;
    isLoadingDischargePorts = false;
    isLoadingCategories = false;
    isLoadingCargoTypes = false;

    private _onDestroy = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<MarineBuyNowModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: MarineBuyNowData,
        private quoteService: QuoteService,
        private userService: UserService,
        private snackBar: MatSnackBar,
        private cdr: ChangeDetectorRef,
        private dialog: MatDialog
    ) {}

    ngOnInit(): void {
        this.shipmentForm = this.fb.group({
            // Document Uploads
            idfDocument: [null, Validators.required],
            invoice: [null, Validators.required],
            kraPinCertificate: [null, Validators.required],
            nationalId: [null, Validators.required],
            agreeToTerms: [false, Validators.requiredTrue],

            // Personal Details & KYC
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            emailAddress: ['', [Validators.required, Validators.email]],
            phoneNumber: ['', Validators.required],
            kraPin: ['', Validators.required],
            idNumber: ['', Validators.required],
            streetAddress: ['', Validators.required],
            postalCode: ['', Validators.required],

            // Shipment Details
            modeOfShipment: ['1', Validators.required], // 1 = Sea, 2 = Air
            tradeType: ['Marine Cargo Import'], // Readonly field - always Marine Cargo Import
            product: ['Marine Cargo Import'], // Readonly field
            cargoProtection: ['', Validators.required], // Marine Product ID (ICC A, B, or C)
            commodityType: ['1', Validators.required], // 1 = Containerized, 2 = Non-Containerized
            selectCategory: ['', Validators.required], // Category ID
            salesCategory: ['', Validators.required], // Cargo Type ID
            countryOfOrigin: ['', Validators.required],
            gcrNumber: [''],
            loadingPort: ['', Validators.required],
            portOfDischarge: ['', Validators.required],
            vesselName: [''],
            finalDestination: ['', Validators.required],
            dateOfDispatch: ['', Validators.required],
            estimatedArrival: ['', Validators.required],
            sumInsured: ['', [Validators.required, Validators.min(1)]],
            goodsDescription: ['', Validators.required],
            mpesaNumber: ['', [Validators.required, Validators.pattern(/^(07|01)[0-9]{8}$/)]],

            // Payment
            paymentMethod: ['mpesa', Validators.required]
        });

        // Initially disable Importer Details and Shipment Details sections
        this.disableFormSections();
        
        // Listen for terms agreement changes
        this.shipmentForm.get('agreeToTerms')?.valueChanges.subscribe((agreed) => {
            if (agreed) {
                this.enableFormSections();
            } else {
                this.disableFormSections();
            }
        });

        this.fetchQuoteDetails();
        // Enable client-side premium calculation when sum insured changes
        this.listenForSumInsuredChanges();
        this.setupSearchableDropdowns();
        
        // Validate data integrity after initialization
        setTimeout(() => {
            this.validateAndRefreshIfNeeded();
        }, 2000); // Allow time for API calls to complete
        
        // Trigger initial search to populate dropdowns
        setTimeout(() => {
            this.triggerInitialSearch();
        }, 500);
    }

    ngAfterViewInit(): void {
        // Use ChangeDetectorRef to avoid ExpressionChangedAfterItHasBeenCheckedError
        this.cdr.detectChanges();
    }

    private premiumRate = 0; // Store the rate from initial quote

    listenForSumInsuredChanges(): void {
        this.shipmentForm.get('sumInsured')?.valueChanges.pipe(
            debounceTime(300),
            distinctUntilChanged(),
            takeUntil(this._onDestroy)
        ).subscribe((sumInsured) => {
            if (sumInsured && sumInsured > 0 && this.premiumRate > 0) {
                // Calculate premium based on rate
                this.premium = sumInsured * this.premiumRate;
                
                // Calculate taxes and levies
                const phcf = this.premium * 0.0025; // 0.25%
                const trainingLevy = this.premium * 0.002; // 0.2%
                const stampDuty = this.premium * 0.0005; // 0.05%
                
                this.tax = phcf + trainingLevy + stampDuty;
                this.total = this.premium + this.tax;
            }
        });
    }

    onFileSelected(event: Event, controlName: string): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        
        if (file) {
            // Clear any existing error for this field
            delete this.duplicateFileErrors[controlName];
            
            // Check if this file is already uploaded in another field
            const documentFields = ['idfDocument', 'invoice', 'kraPinCertificate', 'nationalId'];
            const isDuplicate = documentFields.some(fieldName => {
                if (fieldName === controlName) return false; // Skip current field
                const existingFile = this.shipmentForm.get(fieldName)?.value;
                if (!existingFile) return false;
                
                // Compare file name, size, and last modified date
                return existingFile.name === file.name && 
                       existingFile.size === file.size && 
                       existingFile.lastModified === file.lastModified;
            });

            if (isDuplicate) {
                // Set error message for this field
                this.duplicateFileErrors[controlName] = 'This document has already been uploaded in another field. Please select a different document.';
                
                // Clear the input
                input.value = '';
                
                // Clear the form control value
                this.shipmentForm.get(controlName)?.setValue(null);
                return;
            }

            // Set the file if no duplicate found
            this.shipmentForm.get(controlName)?.setValue(file);
        }
    }

    onSubmit(): void {
        if (this.shipmentForm.invalid) {
            // Mark all fields as touched to show validation errors
            this.shipmentForm.markAllAsTouched();
            this.snackBar.open('Please fill in all required fields correctly', 'Close', {
                duration: 5000,
                panelClass: ['error-snackbar']
            });
            return;
        }

        this.isSubmitting = true;
        const formValue = this.shipmentForm.getRawValue(); // Use getRawValue to include disabled fields
        
        console.log('=== BUY NOW MODAL - FORM SUBMISSION ===');
        console.log('Form data:', formValue);
        console.log('M-Pesa Number:', formValue.mpesaNumber);
        console.log('Total Amount:', this.total);
        console.log('Quote ID:', this.data.quoteId);
        
        // First, create the shipping application
        const formData = new FormData();
        
        // Add all form fields to FormData
        formData.append('quoteId', this.data.quoteId);
        formData.append('firstName', formValue.firstName);
        formData.append('lastName', formValue.lastName);
        formData.append('emailAddress', formValue.emailAddress);
        formData.append('phoneNumber', formValue.phoneNumber);
        formData.append('kraPin', formValue.kraPin);
        formData.append('idNumber', formValue.idNumber);
        formData.append('streetAddress', formValue.streetAddress);
        formData.append('postalCode', formValue.postalCode);
        formData.append('modeOfShipment', formValue.modeOfShipment);
        formData.append('tradeType', formValue.tradeType);
        formData.append('cargoProtection', formValue.cargoProtection);
        formData.append('commodityType', formValue.commodityType);
        formData.append('selectCategory', formValue.selectCategory);
        formData.append('salesCategory', formValue.salesCategory);
        formData.append('countryOfOrigin', formValue.countryOfOrigin);
        formData.append('gcrNumber', formValue.gcrNumber || '');
        formData.append('loadingPort', formValue.loadingPort);
        formData.append('portOfDischarge', formValue.portOfDischarge);
        formData.append('vesselName', formValue.vesselName || '');
        formData.append('finalDestination', formValue.finalDestination);
        formData.append('dateOfDispatch', formValue.dateOfDispatch);
        formData.append('estimatedArrival', formValue.estimatedArrival);
        formData.append('sumInsured', formValue.sumInsured);
        formData.append('goodsDescription', formValue.goodsDescription);
        formData.append('mpesaNumber', formValue.mpesaNumber);
        formData.append('paymentMethod', formValue.paymentMethod);
        
        // Add document files
        if (formValue.idfDocument) {
            formData.append('idfDocument', formValue.idfDocument);
        }
        if (formValue.invoice) {
            formData.append('invoice', formValue.invoice);
        }
        if (formValue.kraPinCertificate) {
            formData.append('kraPinCertificate', formValue.kraPinCertificate);
        }
        if (formValue.nationalId) {
            formData.append('nationalId', formValue.nationalId);
        }
        
        console.log('Creating shipping application...');
        
        // Create the shipping application first
        this.quoteService.createApplication(formData).pipe(
            takeUntil(this._onDestroy)
        ).subscribe({
            next: (applicationResponse) => {
                console.log('Shipping application created successfully:', applicationResponse);
                
                // Generate reference number for M-Pesa payment
                const refNo = applicationResponse?.applicationId || 
                             applicationResponse?.id || 
                             `MAR-${this.data.quoteId}-${Date.now()}`;
                
                console.log('Initiating M-Pesa STK Push...');
                console.log('Reference Number:', refNo);
                
                // Now initiate M-Pesa payment
                this.quoteService.stkPush(formValue.mpesaNumber, this.total, refNo).pipe(
                    takeUntil(this._onDestroy)
                ).subscribe({
                    next: (paymentResponse) => {
                        console.log('=== M-PESA STK PUSH SUCCESS ===');
                        console.log('Payment Response:', paymentResponse);
                        console.log('CheckoutRequestId:', paymentResponse?.CheckoutRequestID || paymentResponse?.checkoutRequestId);
                        console.log('=== END M-PESA SUCCESS ===');
                        
                        this.isSubmitting = false;
                        
                        this.snackBar.open(
                            'STK Push sent! Please enter your M-Pesa PIN on your phone to complete payment.',
                            'Close',
                            {
                                duration: 8000,
                                panelClass: ['success-snackbar']
                            }
                        );
                        
                        // Close modal with success
                        setTimeout(() => {
                            this.dialogRef.close({ 
                                success: true, 
                                applicationId: applicationResponse?.applicationId || applicationResponse?.id,
                                checkoutRequestId: paymentResponse?.CheckoutRequestID || paymentResponse?.checkoutRequestId
                            });
                        }, 2000);
                    },
                    error: (paymentError) => {
                        console.error('=== M-PESA STK PUSH ERROR ===');
                        console.error('Error Status:', paymentError.status);
                        console.error('Error Message:', paymentError.message);
                        console.error('Error Details:', paymentError.error);
                        console.error('Full Error Object:', paymentError);
                        console.error('=== END M-PESA ERROR ===');
                        
                        this.isSubmitting = false;
                        
                        const errorMessage = paymentError?.error?.message || 
                                           paymentError?.message || 
                                           'Payment initiation failed. Please check your M-Pesa number and try again.';
                        
                        this.snackBar.open(errorMessage, 'Close', {
                            duration: 8000,
                            panelClass: ['error-snackbar']
                        });
                    }
                });
            },
            error: (applicationError) => {
                console.error('=== SHIPPING APPLICATION ERROR ===');
                console.error('Error Status:', applicationError.status);
                console.error('Error Message:', applicationError.message);
                console.error('Error Details:', applicationError.error);
                console.error('Full Error Object:', applicationError);
                console.error('=== END APPLICATION ERROR ===');
                
                this.isSubmitting = false;
                
                const errorMessage = applicationError?.error?.message || 
                                   applicationError?.message || 
                                   'Failed to create shipping application. Please try again.';
                
                this.snackBar.open(errorMessage, 'Close', {
                    duration: 8000,
                    panelClass: ['error-snackbar']
                });
            }
        });
    }

    fetchQuoteDetails(): void {
        // For DRAFT quotes, fetch quote details to get premium and pre-populate form
        if (this.data.quoteId) {
            this.userService.getSingleQuote(this.data.quoteId).subscribe({
                next: (quoteData) => {
                    // Pre-populate form with quote data if available
                    if (quoteData) {
                        const sumInsured = quoteData.sumassured || quoteData.sumInsured || 0;
                        const basePremium = quoteData.premium || 0;
                        
                        // Calculate and store the premium rate for future calculations
                        if (sumInsured > 0 && basePremium > 0) {
                            this.premiumRate = basePremium / sumInsured;
                        }
                        
                        this.shipmentForm.patchValue({
                            sumInsured: sumInsured,
                            modeOfShipment: quoteData.shippingmodeId?.toString() || '1',
                            countryOfOrigin: quoteData.originCountry,
                            // Add other fields as needed
                        }, { emitEvent: false }); // Don't trigger valueChanges yet
                        
                        // Set premium values from quote
                        this.premium = basePremium;
                        this.tax = (quoteData.phcf || 0) + (quoteData.tl || 0) + (quoteData.sd || 0);
                        this.total = quoteData.netprem || quoteData.total || 0;
                    }
                    this.isLoading = false;
                },
                error: (err) => {
                    console.error('Error fetching quote details:', err);
                    // Don't block the form if quote fetch fails
                    this.isLoading = false;
                }
            });
        } else {
            this.isLoading = false;
        }
    }

    listenForPremiumChanges(): void {
        this.shipmentForm.get('sumInsured')?.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged(),
            switchMap((sumInsured) => {
                // Only recalculate if sumInsured has a valid value
                if (!sumInsured || sumInsured <= 0) {
                    // Return empty observable to skip recalculation
                    return EMPTY;
                }
                this.isSubmitting = true;
                // Use userService for premium recalculation
                return this.userService.recalculateMarinePremium(this.data.quoteId, sumInsured);
            })
        ).subscribe({
            next: (premiumDetails) => {
                // Only update if we received valid data
                if (premiumDetails) {
                    this.premium = premiumDetails.premium;
                    this.tax = premiumDetails.tax;
                    this.total = premiumDetails.total;
                }
                this.isSubmitting = false;
            },
            error: (err) => {
                console.error('Failed to recalculate premium', err);
                this.snackBar.open('Could not recalculate premium. Please check the value.', 'Close', { duration: 5000 });
                this.isSubmitting = false;
            }
        });
    }

    getCargoProtectionName(): string {
        const selectedId = this.shipmentForm.get('cargoProtection')?.value;
        if (selectedId && this.marineProducts.length > 0) {
            const product = this.marineProducts.find(p => p.id === selectedId);
            return product?.prodname || 'ICC (A) All Risk';
        }
        return 'ICC (A) All Risk';
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    ngOnDestroy() {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    private setupSearchableDropdowns(): void {
        // Initialize all data sources from backend
        this.initializeAllData();
        
        // Setup client-side filtering for counties (no API needed)
        this.fetchCounties();

        // Listen for mode of shipment changes to load countries
        this.shipmentForm.get('modeOfShipment')?.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((mode) => {
                if (mode) {
                    this.countryPage = 0;
                    this.fetchCountries();
                }
            });

        // Listen for search changes with debounce
        this.categorySearchCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy), debounceTime(300))
            .subscribe(() => {
                this.fetchCategories(this.categorySearchCtrl.value);
            });

        this.countrySearchCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy), debounceTime(300))
            .subscribe((searchTerm) => {
                console.log('Country search term:', searchTerm);
                this.countryPage = 0;
                this.fetchCountries(searchTerm || '');
            });

        // Listen to search control changes for ports
        this.loadingPortSearchCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy), debounceTime(300))
            .subscribe((searchTerm) => {
                console.log('Loading port search term:', searchTerm);
                this.loadingPortPage = 0;
                this.fetchPorts('loading', searchTerm || '');
            });

        this.dischargePortSearchCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy), debounceTime(300))
            .subscribe((searchTerm) => {
                console.log('Discharge port search term:', searchTerm);
                this.dischargePortPage = 0;
                this.fetchPorts('discharge', searchTerm || '');
            });

        this.countySearchCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy), debounceTime(300))
            .subscribe(() => {
                this.fetchCounties(this.countySearchCtrl.value);
            });

        this.cargoTypeSearchCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy), debounceTime(300))
            .subscribe(() => {
                this.filterCargoTypes(this.cargoTypeSearchCtrl.value);
            });
        
        // Listen for category selection changes to fetch cargo types
        this.shipmentForm.get('selectCategory')?.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((categoryId) => {
                if (categoryId) {
                    this.fetchCargoTypes(categoryId);
                    // Clear cargo type selection when category changes
                    this.shipmentForm.get('salesCategory')?.setValue('');
                }
            });

        // Listen for country selection changes to fetch ports
        this.shipmentForm.get('countryOfOrigin')?.valueChanges
            .pipe(
                takeUntil(this._onDestroy),
                distinctUntilChanged()
            )
            .subscribe((countryId) => {
                if (countryId) {
                    console.log('Country selected:', countryId);
                    this.loadingPortPage = 0;
                    this.dischargePortPage = 0;
                    this.fetchPorts('loading');
                    this.fetchPorts('discharge');
                } else {
                    // Clear ports when no country is selected
                    this.loadingPorts = [];
                    this.dischargePorts = [];
                    this.filteredLoadingPorts.next([]);
                    this.filteredDischargePorts.next([]);
                }
            });
    }

    private fetchMarineProducts(): void {
        this.userService.getMarineProducts().subscribe({
            next: (response: any) => {
                this.marineProducts = Array.isArray(response) ? response : (response?.data || []);
                console.log('Marine products loaded:', this.marineProducts.length);
                
                // Find ICC(A) All Risk and set as default
                const iccA = this.marineProducts.find(p => 
                    p.prodname?.toLowerCase().includes('icc') && 
                    p.prodname?.toLowerCase().includes('a')
                );
                
                if (iccA) {
                    this.shipmentForm.patchValue({
                        cargoProtection: iccA.id
                    }, { emitEvent: false });
                    console.log('Default cargo protection set:', iccA.prodname);
                } else {
                    console.warn('ICC(A) All Risk product not found in marine products');
                }
            },
            error: (err) => {
                console.error('Error fetching marine products:', err);
                this.marineProducts = [];
                // Show user-friendly error message
                this.showErrorMessage('Failed to load cargo protection options. Please refresh the page.');
            }
        });
    }

    private fetchCategories(searchTerm: string = ''): void {
        // Only fetch once, then filter client-side
        if (this.categories.length === 0 && !this.isLoadingCategories) {
            this.isLoadingCategories = true;
            this.userService.getMarineCategories().subscribe({
                next: (response: any) => {
                    this.categories = Array.isArray(response) ? response : (response?.data || []);
                    console.log('Categories loaded:', this.categories.length);
                    this.filterCategories(searchTerm);
                    this.isLoadingCategories = false;
                },
                error: (err) => {
                    console.error('Error fetching categories:', err);
                    this.categories = [];
                    this.filteredCategories.next([]);
                    this.isLoadingCategories = false;
                    this.showErrorMessage('Failed to load cargo categories. Please refresh the page.');
                }
            });
        } else {
            // Client-side filtering
            this.filterCategories(searchTerm);
        }
    }

    private filterCategories(searchTerm: string = ''): void {
        if (!this.categories) {
            return;
        }
        if (!searchTerm) {
            this.filteredCategories.next(this.categories.slice());
            return;
        }
        const search = searchTerm.toLowerCase();
        const filtered = this.categories.filter(category => 
            category.catname?.toLowerCase().includes(search)
        );
        this.filteredCategories.next(filtered);
    }

    private fetchCountries(searchTerm: string = ''): void {
        // Get the mode of shipment: 'Sea' = 1, 'Air' = 2
        const modeValue = this.shipmentForm.get('modeOfShipment')?.value;
        const modeId = modeValue === '1' ? 1 : modeValue === '2' ? 2 : 1; // Default to Sea (1)
        
        console.log('Fetching countries with mode:', modeId, 'search term:', searchTerm);
        
        this.isLoadingCountries = true;
        this.userService.getCountries(this.countryPage, this.pageSize, modeId, searchTerm).subscribe({
            next: (response) => {
                const newCountries = response?.pageItems || response?.data || [];
                console.log('Countries loaded:', newCountries.length, 'for mode:', modeId);
                console.log('Sample country data:', newCountries.length > 0 ? newCountries[0] : 'No countries');
                
                // Append to existing if pagination, otherwise replace
                if (this.countryPage === 0) {
                    this.countries = newCountries;
                } else {
                    this.countries = [...this.countries, ...newCountries];
                }
                
                console.log('Total countries in array:', this.countries.length);
                this.filteredCountries.next(this.countries.slice());
                this.isLoadingCountries = false;
            },
            error: (err) => {
                console.error('Error fetching countries:', err);
                this.countries = [];
                this.filteredCountries.next([]);
                this.isLoadingCountries = false;
                this.showErrorMessage('Failed to load countries. Please check your connection and try again.');
            }
        });
    }

    private fetchCounties(searchTerm: string = ''): void {
        // Client-side filtering only - no API call
        let filteredCounties = this.kenyanCounties;
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            filteredCounties = this.kenyanCounties.filter(county => 
                county.toLowerCase().includes(search)
            );
        }
        this.filteredCounties.next(filteredCounties);
    }

    private fetchCargoTypes(categoryId: number): void {
        if (!categoryId) {
            this.cargoTypes = [];
            this.filteredCargoTypes.next([]);
            return;
        }

        this.isLoadingCargoTypes = true;
        this.userService.getCargoTypesByCategory(categoryId).subscribe({
            next: (response: any) => {
                this.cargoTypes = Array.isArray(response) ? response : (response?.data || []);
                console.log('Cargo types loaded for category', categoryId, ':', this.cargoTypes.length);
                this.filteredCargoTypes.next(this.cargoTypes.slice());
                this.isLoadingCargoTypes = false;
            },
            error: (err) => {
                console.error('Error fetching cargo types for category', categoryId, ':', err);
                this.cargoTypes = [];
                this.filteredCargoTypes.next([]);
                this.isLoadingCargoTypes = false;
                this.showErrorMessage('Failed to load cargo types for the selected category.');
            }
        });
    }

    private filterCargoTypes(searchTerm: string = ''): void {
        if (!this.cargoTypes) {
            return;
        }
        if (!searchTerm) {
            this.filteredCargoTypes.next(this.cargoTypes.slice());
            return;
        }
        const search = searchTerm.toLowerCase();
        const filtered = this.cargoTypes.filter(cargoType => 
            cargoType.ctname?.toLowerCase().includes(search)
        );
        this.filteredCargoTypes.next(filtered);
    }

    private initializeAllData(): void {
        // Initialize all required data from backend APIs
        this.fetchMarineProducts();
        this.fetchCategories();
        
        // Load initial countries (empty search to get all)
        this.fetchCountries('');
        
        // Only initialize counties since it's client-side data
        this.filteredCounties.next(this.kenyanCounties.slice());
        
        // Initialize empty arrays for ports (will be loaded when country is selected)
        this.filteredLoadingPorts.next([]);
        this.filteredDischargePorts.next([]);
        
        console.log('Data initialization started...');
    }

    private triggerInitialSearch(): void {
        // Trigger initial empty searches to populate dropdowns
        console.log('Triggering initial search for all dropdowns...');
        
        // Trigger country search with empty term to load initial data
        if (this.countries.length === 0) {
            this.countrySearchCtrl.setValue('');
        }
        
        // Trigger category search with empty term to load initial data
        if (this.categories.length === 0) {
            this.categorySearchCtrl.setValue('');
        }
        
        // Counties are already loaded (client-side data)
        console.log('Initial search triggered for all API-based dropdowns');
    }

    public onDropdownOpen(dropdownType: 'countries' | 'categories' | 'loadingPorts' | 'dischargePorts'): void {
        console.log(`Dropdown opened: ${dropdownType}`);
        
        switch (dropdownType) {
            case 'countries':
                if (this.countries.length === 0 && !this.isLoadingCountries) {
                    this.fetchCountries('');
                }
                break;
            case 'categories':
                if (this.categories.length === 0 && !this.isLoadingCategories) {
                    this.fetchCategories('');
                }
                break;
            case 'loadingPorts':
                const countryId = this.shipmentForm.get('countryOfOrigin')?.value;
                if (countryId && this.loadingPorts.length === 0 && !this.isLoadingLoadingPorts) {
                    this.fetchPorts('loading', '');
                }
                break;
            case 'dischargePorts':
                const countryIdDischarge = this.shipmentForm.get('countryOfOrigin')?.value;
                if (countryIdDischarge && this.dischargePorts.length === 0 && !this.isLoadingDischargePorts) {
                    this.fetchPorts('discharge', '');
                }
                break;
        }
    }

    private showErrorMessage(message: string): void {
        this.snackBar.open(message, 'Close', {
            duration: 5000,
            panelClass: ['error-snackbar']
        });
    }

    private showSuccessMessage(message: string): void {
        this.snackBar.open(message, 'Close', {
            duration: 3000,
            panelClass: ['success-snackbar']
        });
    }

    public refreshAllData(): void {
        // Reset all data arrays
        this.countries = [];
        this.categories = [];
        this.cargoTypes = [];
        this.marineProducts = [];
        this.loadingPorts = [];
        this.dischargePorts = [];
        
        // Reset loading states
        this.isLoadingCountries = false;
        this.isLoadingCategories = false;
        this.isLoadingCargoTypes = false;
        this.isLoadingLoadingPorts = false;
        this.isLoadingDischargePorts = false;
        
        // Reset pagination
        this.countryPage = 0;
        this.loadingPortPage = 0;
        this.dischargePortPage = 0;
        
        // Reinitialize all data
        this.initializeAllData();
        
        this.showSuccessMessage('Data refreshed successfully');
    }

    private validateDataIntegrity(): boolean {
        const validationResults = {
            counties: this.kenyanCounties.length === 47,
            marineProducts: this.marineProducts.length > 0,
            categories: this.categories.length > 0,
            countries: this.countries.length > 0
        };

        console.log('Data validation results:', validationResults);

        if (!validationResults.counties) {
            console.warn('Counties validation failed: Expected 47 counties, got', this.kenyanCounties.length);
        }

        if (!validationResults.marineProducts) {
            console.warn('Marine products validation failed: No products loaded');
        }

        if (!validationResults.categories) {
            console.warn('Categories validation failed: No categories loaded');
        }

        if (!validationResults.countries) {
            console.warn('Countries validation failed: No countries loaded');
        }

        return Object.values(validationResults).every(result => result);
    }

    public validateAndRefreshIfNeeded(): void {
        if (!this.validateDataIntegrity()) {
            console.log('Data integrity check failed, attempting retry...');
            this.retryFailedApiCalls();
        } else {
            console.log('Data integrity check passed');
        }
    }

    private retryFailedApiCalls(): void {
        // Retry failed API calls with exponential backoff
        const retryAttempts = 3;
        const baseDelay = 1000; // 1 second

        const retryWithBackoff = (apiCall: () => void, attempt: number = 1) => {
            if (attempt > retryAttempts) {
                console.error('Max retry attempts reached for API call');
                return;
            }

            const delay = baseDelay * Math.pow(2, attempt - 1);
            setTimeout(() => {
                try {
                    apiCall();
                } catch (error) {
                    console.warn(`API call failed on attempt ${attempt}, retrying...`);
                    retryWithBackoff(apiCall, attempt + 1);
                }
            }, delay);
        };

        // Retry critical data if not loaded
        if (this.marineProducts.length === 0) {
            retryWithBackoff(() => this.fetchMarineProducts());
        }

        if (this.categories.length === 0) {
            retryWithBackoff(() => this.fetchCategories());
        }

        if (this.countries.length === 0) {
            retryWithBackoff(() => this.fetchCountries());
        }
    }

    get termsAgreed(): boolean {
        return this.shipmentForm.get('agreeToTerms')?.value || false;
    }

    private disableFormSections(): void {
        // Disable Importer Details fields
        this.shipmentForm.get('firstName')?.disable();
        this.shipmentForm.get('lastName')?.disable();
        this.shipmentForm.get('emailAddress')?.disable();
        this.shipmentForm.get('phoneNumber')?.disable();
        this.shipmentForm.get('kraPin')?.disable();
        this.shipmentForm.get('idNumber')?.disable();
        this.shipmentForm.get('streetAddress')?.disable();
        this.shipmentForm.get('postalCode')?.disable();

        // Disable Shipment Details fields
        this.shipmentForm.get('modeOfShipment')?.disable();
        this.shipmentForm.get('tradeType')?.disable();
        this.shipmentForm.get('product')?.disable();
        this.shipmentForm.get('commodityType')?.disable();
        this.shipmentForm.get('salesCategory')?.disable();
        this.shipmentForm.get('countryOfOrigin')?.disable();
        this.shipmentForm.get('gcrNumber')?.disable();
        this.shipmentForm.get('idNumber2')?.disable();
        this.shipmentForm.get('loadingPort')?.disable();
        this.shipmentForm.get('portOfDischarge')?.disable();
        this.shipmentForm.get('vesselName')?.disable();
        this.shipmentForm.get('finalDestination')?.disable();
        this.shipmentForm.get('dateOfDispatch')?.disable();
        this.shipmentForm.get('estimatedArrival')?.disable();
        this.shipmentForm.get('sumInsured')?.disable();
        this.shipmentForm.get('goodsDescription')?.disable();
    }

    private enableFormSections(): void {
        // Enable Importer Details fields
        this.shipmentForm.get('firstName')?.enable();
        this.shipmentForm.get('lastName')?.enable();
        this.shipmentForm.get('emailAddress')?.enable();
        this.shipmentForm.get('phoneNumber')?.enable();
        this.shipmentForm.get('kraPin')?.enable();
        this.shipmentForm.get('idNumber')?.enable();
        this.shipmentForm.get('streetAddress')?.enable();
        this.shipmentForm.get('postalCode')?.enable();

        // Enable Shipment Details fields
        this.shipmentForm.get('modeOfShipment')?.enable();
        this.shipmentForm.get('tradeType')?.enable();
        this.shipmentForm.get('product')?.enable();
        this.shipmentForm.get('commodityType')?.enable();
        this.shipmentForm.get('salesCategory')?.enable();
        this.shipmentForm.get('countryOfOrigin')?.enable();
        this.shipmentForm.get('gcrNumber')?.enable();
        this.shipmentForm.get('idNumber2')?.enable();
        this.shipmentForm.get('loadingPort')?.enable();
        this.shipmentForm.get('portOfDischarge')?.enable();
        this.shipmentForm.get('vesselName')?.enable();
        this.shipmentForm.get('finalDestination')?.enable();
        this.shipmentForm.get('dateOfDispatch')?.enable();
        this.shipmentForm.get('estimatedArrival')?.enable();
        this.shipmentForm.get('sumInsured')?.enable();
        this.shipmentForm.get('goodsDescription')?.enable();

        // Ports will be fetched automatically when country is selected via valueChanges subscription
    }

    private fetchPorts(type: 'loading' | 'discharge', searchTerm: string = ''): void {
        const countryId = this.shipmentForm.get('countryOfOrigin')?.value;
        
        if (!countryId) {
            // Clear ports if no country is selected
            if (type === 'loading') {
                this.loadingPorts = [];
                this.filteredLoadingPorts.next([]);
            } else {
                this.dischargePorts = [];
                this.filteredDischargePorts.next([]);
            }
            return;
        }

        const page = type === 'loading' ? this.loadingPortPage : this.dischargePortPage;
        
        console.log(`=== FETCHING ${type.toUpperCase()} PORTS ===`);
        console.log('Country ID:', countryId);
        console.log('Search term:', searchTerm);
        console.log('Page:', page);
        console.log('Page size:', this.pageSize);
        console.log('API call: getPorts(countryId, "all", page, pageSize, searchTerm)');
        console.log(`=== END FETCH PARAMS ===`);
        
        if (type === 'loading') {
            this.isLoadingLoadingPorts = true;
        } else {
            this.isLoadingDischargePorts = true;
        }

        this.userService.getPorts(countryId, 'all', page, this.pageSize, searchTerm).subscribe({
            next: (response) => {
                console.log(`Raw ${type} ports API response:`, response);
                const newPorts = response?.pageItems || response?.data || [];
                console.log(`${type} ports loaded for country ${countryId}:`, newPorts.length);
                
                if (newPorts.length > 0) {
                    console.log(`=== ${type.toUpperCase()} PORTS API ANALYSIS ===`);
                    console.log(`Sample ${type} port object:`, newPorts[0]);
                    console.log(`Available properties:`, Object.keys(newPorts[0]));
                    console.log(`Property values:`, newPorts[0]);
                    
                    // Test different possible property names
                    const testPort = newPorts[0];
                    console.log(`Testing property names for ${type} ports:`);
                    console.log('- id:', testPort.id);
                    console.log('- portId:', testPort.portId);
                    console.log('- portid:', testPort.portid);
                    console.log('- name:', testPort.name);
                    console.log('- portName:', testPort.portName);
                    console.log('- portname:', testPort.portname);
                    console.log('- pname:', testPort.pname);
                    console.log(`=== END ${type.toUpperCase()} PORTS ANALYSIS ===`);
                }
                
                if (type === 'loading') {
                    // Append to existing if pagination, otherwise replace
                    if (this.loadingPortPage === 0) {
                        this.loadingPorts = newPorts;
                    } else {
                        this.loadingPorts = [...this.loadingPorts, ...newPorts];
                    }
                    this.filteredLoadingPorts.next(this.loadingPorts.slice());
                    this.isLoadingLoadingPorts = false;
                } else {
                    // Append to existing if pagination, otherwise replace
                    if (this.dischargePortPage === 0) {
                        this.dischargePorts = newPorts;
                    } else {
                        this.dischargePorts = [...this.dischargePorts, ...newPorts];
                    }
                    this.filteredDischargePorts.next(this.dischargePorts.slice());
                    this.isLoadingDischargePorts = false;
                }
            },
            error: (err) => {
                console.log(`=== ${type.toUpperCase()} PORTS API ERROR ===`);
                console.log('Error status:', err.status);
                console.log('Error message:', err.message);
                console.log('Error URL:', err.url);
                console.log('Full error object:', err);
                console.log(`=== END ${type.toUpperCase()} PORTS ERROR ===`);
                
                if (type === 'loading') {
                    this.loadingPorts = [];
                    this.filteredLoadingPorts.next([]);
                    this.isLoadingLoadingPorts = false;
                } else {
                    this.dischargePorts = [];
                    this.filteredDischargePorts.next([]);
                    this.isLoadingDischargePorts = false;
                }
                
                // Handle different error types gracefully
                if (err.status === 401) {
                    console.error(`${type} ports API authentication failed. Backend needs to fix authentication for ports endpoint.`);
                    console.error(`API URL: ${err.url}`);
                    console.error(`This is a backend authentication issue that needs to be resolved.`);
                } else if (err.status === 0) {
                    console.warn(`${type} ports API unreachable. Network or CORS issue.`);
                    if (searchTerm) {
                        this.showErrorMessage(`Network error loading ${type} ports. Please check your connection.`);
                    }
                } else {
                    console.error(`Unexpected error loading ${type} ports:`, err.status, err.message);
                    if (searchTerm) {
                        this.showErrorMessage(`Failed to load ${type} ports. Please try again or select a different country.`);
                    }
                }
            }
        });
    }


    // Scroll event handlers for infinite scroll (server-side only)
    onCountryScroll(): void {
        if (!this.isLoadingCountries) {
            this.countryPage++;
            this.fetchCountries(this.countrySearchCtrl.value);
        }
    }

    onLoadingPortScroll(): void {
        if (!this.isLoadingLoadingPorts) {
            this.loadingPortPage++;
            this.fetchPorts('loading', this.loadingPortSearchCtrl.value);
        }
    }

    onDischargePortScroll(): void {
        if (!this.isLoadingDischargePorts) {
            this.dischargePortPage++;
            this.fetchPorts('discharge', this.dischargePortSearchCtrl.value);
        }
    }

    openTermsOfUse(event: Event): void {
        event.preventDefault();
        const dialogRef = this.dialog.open(TermsModalComponent, {
            width: '600px',
            maxWidth: '90vw',
            maxHeight: '80vh',
            panelClass: 'terms-modal'
        });
    }

    openPrivacyPolicy(event: Event): void {
        event.preventDefault();
        const dialogRef = this.dialog.open(PrivacyModalComponent, {
            width: '600px',
            maxWidth: '90vw',
            maxHeight: '80vh',
            panelClass: 'privacy-modal'
        });
    }
}

// Terms of Use Modal Component
@Component({
    selector: 'app-terms-modal',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
    template: `
        <div class="modal-container">
            <div class="modal-header">
                <h2 class="modal-title">Terms of Use</h2>
                <button mat-icon-button (click)="close()" class="close-button">
                    <mat-icon>close</mat-icon>
                </button>
            </div>
            <div class="modal-content">
                <div class="overflow-y-auto max-h-[60vh] text-sm text-gray-700 space-y-4 p-6">
                    <p class="font-semibold text-base">Terms of Use for Geminia Insurance Company Limited</p>
                    <p>By accessing and using the services provided by Geminia Insurance Company Limited, you agree to comply with and be bound by the following terms and conditions:</p>
                    
                    <div>
                        <h3 class="font-semibold text-gray-900 mb-1">1. Service Agreement</h3>
                        <p>These terms constitute a binding agreement between you and Geminia Insurance Company Limited regarding your use of our insurance services and platform.</p>
                    </div>
                    
                    <div>
                        <h3 class="font-semibold text-gray-900 mb-1">2. Eligibility</h3>
                        <p>You must be at least 18 years old and legally capable of entering into binding contracts to use our services.</p>
                    </div>
                    
                    <div>
                        <h3 class="font-semibold text-gray-900 mb-1">3. Accurate Information</h3>
                        <p>You agree to provide accurate, current, and complete information during registration and throughout your use of our services.</p>
                    </div>
                    
                    <div>
                        <h3 class="font-semibold text-gray-900 mb-1">4. Privacy and Data Protection</h3>
                        <p>Your privacy is important to us. Please review our Data Privacy Policy to understand how we collect, use, and protect your personal information.</p>
                    </div>
                    
                    <div>
                        <h3 class="font-semibold text-gray-900 mb-1">5. Service Availability</h3>
                        <p>We strive to maintain service availability but cannot guarantee uninterrupted access to our platform.</p>
                    </div>
                    
                    <div>
                        <h3 class="font-semibold text-gray-900 mb-1">6. Limitation of Liability</h3>
                        <p>Geminia Insurance Company Limited shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of our services.</p>
                    </div>
                    
                    <div>
                        <h3 class="font-semibold text-gray-900 mb-1">7. Modifications</h3>
                        <p>We reserve the right to modify these terms at any time. Continued use of our services after modifications constitutes acceptance of the updated terms.</p>
                    </div>
                    
                    <p class="text-xs text-gray-500 mt-4">Last updated: October 7, 2025</p>
                </div>
                <div class="px-6 pb-6 flex justify-end">
                    <button mat-raised-button class="action-button" (click)="close()">Close</button>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .modal-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            overflow: hidden;
        }

        .modal-header {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px 24px;
            background-color: #21275c;
            color: white;
            position: relative;
            flex-shrink: 0;
        }

        .modal-title {
            color: white;
            font-size: 20px;
            font-weight: 600;
            margin: 0;
            text-align: center;
        }

        .close-button {
            position: absolute;
            top: 8px;
            right: 8px;
            color: white;
        }

        .modal-content {
            flex: 1;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
        }

        .action-button {
            background-color: #21275c !important;
            color: white !important;
            padding: 8px 24px;
            font-weight: 500;
        }

        .action-button:hover {
            background-color: #2d3470 !important;
        }
    `]
})
export class TermsModalComponent {
    constructor(public dialogRef: MatDialogRef<TermsModalComponent>) {}
    
    close(): void {
        this.dialogRef.close();
    }
}

// Privacy Policy Modal Component
@Component({
    selector: 'app-privacy-modal',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
    template: `
        <div class="modal-container">
            <div class="modal-header">
                <h2 class="modal-title">Data Privacy Policy</h2>
                <button mat-icon-button (click)="close()" class="close-button">
                    <mat-icon>close</mat-icon>
                </button>
            </div>
            <div class="modal-content">
                <div class="overflow-y-auto max-h-[60vh] text-sm text-gray-700 space-y-4 p-6">
                    <p class="font-semibold text-base">Data Privacy Statement - Geminia Insurance Company Limited</p>
                    <p>Geminia Insurance Company Limited is committed to protecting the fundamental human right to privacy of those with whom we interact. We recognize the need to safeguard personal data that is collected or disclosed to us as part of the Know-your-customer information required by us in order to provide you with the requisite financial product or service.</p>
                    
                    <p>We are committed to complying with the requirements of the Data Protection Act and the attendant regulations as well as best global best practices regarding the processing of your personal data. In this regard, you are required to acquaint yourselves with our data privacy statement which is intended to tell you how we use your personal data and describes how we collect and process your personal data during and after your relationship with us.</p>
                    
                    <div>
                        <h3 class="font-semibold text-gray-900 mb-1">Data Collection</h3>
                        <p>We collect personal data necessary for providing insurance services, including but not limited to identification information, contact details, and financial information required for Know Your Customer (KYC) compliance.</p>
                    </div>
                    
                    <div>
                        <h3 class="font-semibold text-gray-900 mb-1">Purpose of Processing</h3>
                        <p>Your personal data is processed for the following purposes:</p>
                        <ul class="list-disc pl-5 mt-2 space-y-1">
                            <li>Provision of insurance products and services</li>
                            <li>Compliance with regulatory requirements</li>
                            <li>Risk assessment and underwriting</li>
                            <li>Claims processing and settlement</li>
                            <li>Customer service and support</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 class="font-semibold text-gray-900 mb-1">Data Security</h3>
                        <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction.</p>
                    </div>
                    
                    <div>
                        <h3 class="font-semibold text-gray-900 mb-1">Your Rights</h3>
                        <p>You have the right to access, rectify, erase, or restrict processing of your personal data, as well as the right to data portability and to object to processing under certain circumstances.</p>
                    </div>
                    
                    <div>
                        <h3 class="font-semibold text-gray-900 mb-1">Data Retention</h3>
                        <p>We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected or as required by applicable laws and regulations.</p>
                    </div>
                    
                    <div>
                        <h3 class="font-semibold text-gray-900 mb-1">Contact Information</h3>
                        <p>For more detailed information about our data processing practices, please visit: <a href="https://geminia.co.ke/data-privacy-statement/" target="_blank" class="text-blue-600 hover:underline">https://geminia.co.ke/data-privacy-statement/</a></p>
                    </div>
                    
                    <p class="text-xs text-gray-500 mt-4">Last updated: October 7, 2025</p>
                </div>
                <div class="px-6 pb-6 flex justify-end">
                    <button mat-raised-button class="action-button" (click)="close()">Close</button>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .modal-container {
            display: flex;
            flex-direction: column;
            height: 100%;
            width: 100%;
            overflow: hidden;
        }

        .modal-header {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 16px 24px;
            background-color: #21275c;
            color: white;
            position: relative;
            flex-shrink: 0;
        }

        .modal-title {
            color: white;
            font-size: 20px;
            font-weight: 600;
            margin: 0;
            text-align: center;
        }

        .close-button {
            position: absolute;
            top: 8px;
            right: 8px;
            color: white;
        }

        .modal-content {
            flex: 1;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
        }

        .action-button {
            background-color: #21275c !important;
            color: white !important;
            padding: 8px 24px;
            font-weight: 500;
        }

        .action-button:hover {
            background-color: #2d3470 !important;
        }
    `]
})
export class PrivacyModalComponent {
    constructor(public dialogRef: MatDialogRef<PrivacyModalComponent>) {}
    
    close(): void {
        this.dialogRef.close();
    }
}
