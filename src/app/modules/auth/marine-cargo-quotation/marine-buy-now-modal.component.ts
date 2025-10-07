import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { QuoteService } from '../shared/services/quote.service';
import { UserService } from 'app/core/user/user.service';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject, Subject, EMPTY } from 'rxjs';
import { take, takeUntil, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';
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
    `]

})
export class MarineBuyNowModalComponent implements OnInit {
    shipmentForm: FormGroup;
    isSubmitting = false;
    isLoading = true;
    premium = 0;
    tax = 0;
    total = 0;
    
    // Track duplicate file errors
    duplicateFileErrors: { [key: string]: string } = {};

    // County Data
    kenyanCounties: string[] = [
        'Mombasa', 'Kwale', 'Kilifi', 'Tana River', 'Lamu', 'Taita-Taveta', 'Garissa', 'Wajir', 'Mandera', 'Marsabit',
        'Isiolo', 'Meru', 'Tharaka-Nithi', 'Embu', 'Kitui', 'Machakos', 'Makueni', 'Nyandarua', 'Nyeri', 'Kirinyaga',
        'Murang\u0027a', 'Kiambu', 'Turkana', 'West Pokot', 'Samburu', 'Trans Nzoia', 'Uasin Gishu', 'Elgeyo-Marakwet',
        'Nandi', 'Baringo', 'Laikipia', 'Nakuru', 'Narok', 'Kajiado', 'Kericho', 'Bomet', 'Kakamega', 'Vihiga',
        'Bungoma', 'Busia', 'Siaya', 'Kisumu', 'Homa Bay', 'Migori', 'Kisii', 'Nyamira', 'Nairobi'
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
    filteredCounties: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
    filteredCargoTypes: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

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
            destination: ['Kenya'], // Readonly field
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
            return;
        }

        this.isSubmitting = true;
        console.log('Form submitted:', this.shipmentForm.value);
        
        // Simulate API call
        setTimeout(() => {
            this.isSubmitting = false;
            alert('Payment processing would happen here');
            this.dialogRef.close({ success: true });
        }, 2000);
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
        // Load initial data
        this.fetchMarineProducts();
        this.fetchCategories();
        this.fetchCounties();
        this.fetchCountries();

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
            .subscribe(() => {
                this.countryPage = 0;
                this.fetchCountries(this.countrySearchCtrl.value);
            });

        this.loadingPortSearchCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy), debounceTime(300))
            .subscribe(() => {
                this.loadingPortPage = 0;
                this.fetchPorts('loading', this.loadingPortSearchCtrl.value);
            });

        this.dischargePortSearchCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy), debounceTime(300))
            .subscribe(() => {
                this.dischargePortPage = 0;
                this.fetchPorts('discharge', this.dischargePortSearchCtrl.value);
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
                if (countryId && this.termsAgreed) {
                    this.loadingPortPage = 0;
                    this.dischargePortPage = 0;
                    this.fetchPorts('loading');
                    this.fetchPorts('discharge');
                }
            });
    }

    private fetchMarineProducts(): void {
        this.userService.getMarineProducts().subscribe({
            next: (response: any) => {
                this.marineProducts = response || [];
                // Find ICC(A) All Risk and set as default
                const iccA = this.marineProducts.find(p => 
                    p.prodname?.toLowerCase().includes('icc') && 
                    p.prodname?.toLowerCase().includes('a')
                );
                if (iccA) {
                    this.shipmentForm.patchValue({
                        cargoProtection: iccA.id
                    }, { emitEvent: false });
                }
            },
            error: (err) => {
                console.error('Error fetching marine products:', err);
                this.marineProducts = [];
            }
        });
    }

    private fetchCategories(searchTerm: string = ''): void {
        // Only fetch once, then filter client-side
        if (this.categories.length === 0 && !this.isLoadingCategories) {
            this.isLoadingCategories = true;
            this.userService.getMarineCategories().subscribe({
                next: (response: any) => {
                    this.categories = response || [];
                    this.filterCategories(searchTerm);
                    this.isLoadingCategories = false;
                },
                error: (err) => {
                    console.error('Error fetching categories:', err);
                    this.categories = [];
                    this.filteredCategories.next([]);
                    this.isLoadingCategories = false;
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
        const modeId = modeValue === 'Sea' ? 1 : modeValue === 'Air' ? 2 : 1; // Default to Sea (1)
        
        this.isLoadingCountries = true;
        this.userService.getCountries(this.countryPage, this.pageSize, modeId, searchTerm).subscribe({
            next: (response) => {
                const newCountries = response.pageItems || [];
                
                // Append to existing if pagination, otherwise replace
                if (this.countryPage === 0) {
                    this.countries = newCountries;
                } else {
                    this.countries = [...this.countries, ...newCountries];
                }
                
                this.filteredCountries.next(this.countries.slice());
                this.isLoadingCountries = false;
            },
            error: (err) => {
                console.error('Error fetching countries:', err);
                this.countries = [];
                this.filteredCountries.next([]);
                this.isLoadingCountries = false;
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
        this.isLoadingCargoTypes = true;
        this.userService.getCargoTypesByCategory(categoryId).subscribe({
            next: (response: any) => {
                this.cargoTypes = response || [];
                this.filteredCargoTypes.next(this.cargoTypes.slice());
                this.isLoadingCargoTypes = false;
            },
            error: (err) => {
                console.error('Error fetching cargo types:', err);
                this.cargoTypes = [];
                this.filteredCargoTypes.next([]);
                this.isLoadingCargoTypes = false;
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
        this.shipmentForm.get('destination')?.disable();
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
        this.shipmentForm.get('destination')?.enable();
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

        // Fetch ports if country is already selected
        const countryId = this.shipmentForm.get('countryOfOrigin')?.value;
        if (countryId) {
            this.loadingPortPage = 0;
            this.dischargePortPage = 0;
            this.fetchPorts('loading');
            this.fetchPorts('discharge');
        }
    }

    private fetchPorts(type: 'loading' | 'discharge', searchTerm: string = ''): void {
        const countryId = this.shipmentForm.get('countryOfOrigin')?.value;
        
        if (!countryId) {
            // Don't fetch ports if no country is selected
            return;
        }

        const page = type === 'loading' ? this.loadingPortPage : this.dischargePortPage;
        
        if (type === 'loading') {
            this.isLoadingLoadingPorts = true;
        } else {
            this.isLoadingDischargePorts = true;
        }

        this.userService.getPorts(countryId, 'all', page, this.pageSize, searchTerm).subscribe({
            next: (response) => {
                const newPorts = response.pageItems || [];
                
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
                console.error(`Error fetching ${type} ports:`, err);
                if (type === 'loading') {
                    this.loadingPorts = [];
                    this.filteredLoadingPorts.next([]);
                    this.isLoadingLoadingPorts = false;
                } else {
                    this.dischargePorts = [];
                    this.filteredDischargePorts.next([]);
                    this.isLoadingDischargePorts = false;
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
        <div class="p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-900">Terms of Use</h2>
                <button mat-icon-button (click)="close()">
                    <mat-icon>close</mat-icon>
                </button>
            </div>
            <div class="overflow-y-auto max-h-[60vh] text-sm text-gray-700 space-y-4">
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
            <div class="mt-6 flex justify-end">
                <button mat-raised-button color="primary" (click)="close()">Close</button>
            </div>
        </div>
    `
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
        <div class="p-6">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl font-bold text-gray-900">Data Privacy Policy</h2>
                <button mat-icon-button (click)="close()">
                    <mat-icon>close</mat-icon>
                </button>
            </div>
            <div class="overflow-y-auto max-h-[60vh] text-sm text-gray-700 space-y-4">
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
            <div class="mt-6 flex justify-end">
                <button mat-raised-button color="primary" (click)="close()">Close</button>
            </div>
        </div>
    `
})
export class PrivacyModalComponent {
    constructor(public dialogRef: MatDialogRef<PrivacyModalComponent>) {}
    
    close(): void {
        this.dialogRef.close();
    }
}
