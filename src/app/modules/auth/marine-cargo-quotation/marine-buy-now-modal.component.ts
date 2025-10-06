import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
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
import { ReplaySubject, Subject } from 'rxjs';
import { take, takeUntil, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { FormControl } from '@angular/forms';

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
        NgxMatSelectSearchModule
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

        .modal-header {
          display: flex;
          align-items: center;
          padding: 20px 24px;
          background-color: var(--primary-color);
          color: white;
          position: relative;
        }

        .header-icon-wrapper {
          width: 48px;
          height: 48px;
          background-color: rgba(255, 255, 255, .1);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 16px;
        }

        .header-icon-wrapper mat-icon {
          color: var(--secondary-color);
          font-size: 28px;
          width: 28px;
          height: 28px;
        }

        .header-text-content {
          flex-grow: 1;
        }

        .modal-title {
          color: white;
          font-size: 22px;
          font-weight: 700;
          margin: 0;
        }

        .modal-subtitle {
          font-size: 14px;
          opacity: .8;
          margin-top: 4px;
        }

        .close-button {
          position: absolute;
          top: 12px;
          right: 12px;
          color: white;
        }

        .recalculation-notice {
            background-color: #eef2ff;
            color: #4338ca;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 1.5rem;
            font-size: 0.875rem;
            display: flex;
            align-items: center;
        }

        .recalculation-notice mat-icon {
            margin-right: 8px;
        }

        .disabled-section {
            position: relative;
            pointer-events: none;
            opacity: 0.5;
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
    `]

})
export class MarineBuyNowModalComponent implements OnInit {
    shipmentForm: FormGroup;
    isSubmitting = false;
    isLoading = true;
    premium = 0;
    tax = 0;
    total = 0;

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

    // Search controls for dropdowns
    countrySearchCtrl: FormControl = new FormControl();
    loadingPortSearchCtrl: FormControl = new FormControl();
    dischargePortSearchCtrl: FormControl = new FormControl();

    // Observable streams for filtered data
    filteredCountries: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
    filteredLoadingPorts: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);
    filteredDischargePorts: ReplaySubject<any[]> = new ReplaySubject<any[]>(1);

    private _onDestroy = new Subject<void>();

    constructor(
        private fb: FormBuilder,
        public dialogRef: MatDialogRef<MarineBuyNowModalComponent>,
        @Inject(MAT_DIALOG_DATA) public data: MarineBuyNowData,
        private quoteService: QuoteService,
        private userService: UserService,
        private snackBar: MatSnackBar
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
            modeOfShipment: ['Sea', Validators.required],
            tradeType: ['', Validators.required],
            product: ['', Validators.required],
            commodityType: ['Containerized', Validators.required],
            salesCategory: ['', Validators.required],
            destination: ['Kenya', Validators.required],
            countryOfOrigin: ['', Validators.required],
            gcrNumber: [''],
            idNumber2: ['', Validators.required],
            loadingPort: ['', Validators.required],
            portOfDischarge: ['', Validators.required],
            vesselName: [''],
            finalDestination: ['', Validators.required],
            dateOfDispatch: ['', Validators.required],
            estimatedArrival: ['', Validators.required],
            sumInsured: ['', [Validators.required, Validators.min(1)]],
            goodsDescription: ['', Validators.required],

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
        this.listenForPremiumChanges();
        this.setupSearchableDropdowns();
    }

    onFileSelected(event: Event, controlName: string): void {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (file) {
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
        // For DRAFT quotes, we don't have shipping application data yet
        // Just initialize with empty form and let user fill it in
        this.isLoading = false;
        
        // Optionally, you could fetch basic quote data here if needed
        // using quoteService.getQuoteById() instead of getShipmentDetails()
    }

    listenForPremiumChanges(): void {
        this.shipmentForm.get('sumInsured')?.valueChanges.pipe(
            debounceTime(500),
            distinctUntilChanged(),
            switchMap((sumInsured) => {
                this.isSubmitting = true;
                return this.quoteService.recalculateMarinePremium(this.data.quoteId, sumInsured);
            })
        ).subscribe({
            next: (premiumDetails) => {
                this.premium = premiumDetails.premium;
                this.tax = premiumDetails.tax;
                this.total = premiumDetails.total;
                this.isSubmitting = false;
            },
            error: (err) => {
                console.error('Failed to recalculate premium', err);
                this.snackBar.open('Could not recalculate premium. Please check the value.', 'Close', { duration: 5000 });
                this.isSubmitting = false;
            }
        });
    }

    closeDialog(): void {
        this.dialogRef.close();
    }

    ngOnDestroy() {
        this._onDestroy.next();
        this._onDestroy.complete();
    }

    private setupSearchableDropdowns(): void {
        // Listen for mode of shipment changes to load countries
        this.shipmentForm.get('modeOfShipment')?.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((mode) => {
                if (mode) {
                    this.fetchCountries();
                }
            });

        // Load initial countries based on default mode (Sea = 1)
        this.fetchCountries();

        // Listen for search changes
        this.countrySearchCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy), debounceTime(300))
            .subscribe(() => this.fetchCountries(this.countrySearchCtrl.value));

        this.loadingPortSearchCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy), debounceTime(300))
            .subscribe(() => this.fetchPorts('loading', this.loadingPortSearchCtrl.value));

        this.dischargePortSearchCtrl.valueChanges
            .pipe(takeUntil(this._onDestroy), debounceTime(300))
            .subscribe(() => this.fetchPorts('discharge', this.dischargePortSearchCtrl.value));
        
        // Listen for country selection changes to fetch ports
        this.shipmentForm.get('countryOfOrigin')?.valueChanges
            .pipe(takeUntil(this._onDestroy))
            .subscribe((countryId) => {
                if (countryId) {
                    this.fetchPorts('loading');
                    this.fetchPorts('discharge');
                }
            });
    }

    private fetchCountries(searchTerm: string = ''): void {
        // Get the mode of shipment: 'Sea' = 1, 'Air' = 2
        const modeValue = this.shipmentForm.get('modeOfShipment')?.value;
        const modeId = modeValue === 'Sea' ? 1 : modeValue === 'Air' ? 2 : 1; // Default to Sea (1)
        
        this.userService.getCountries(0, 50, modeId, searchTerm).subscribe({
            next: (response) => {
                this.countries = response.pageItems || [];
                this.filteredCountries.next(this.countries.slice());
            },
            error: (err) => {
                console.error('Error fetching countries:', err);
                this.countries = [];
                this.filteredCountries.next([]);
            }
        });
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
    }

    private fetchPorts(type: 'loading' | 'discharge', searchTerm: string = ''): void {
        const countryId = this.shipmentForm.get('countryOfOrigin')?.value;
        
        if (!countryId) {
            // Don't fetch ports if no country is selected
            return;
        }

        this.userService.getPorts(countryId, 'all', 0, 50, searchTerm).subscribe({
            next: (response) => {
                if (type === 'loading') {
                    this.loadingPorts = response.pageItems || [];
                    this.filteredLoadingPorts.next(this.loadingPorts.slice());
                } else {
                    this.dischargePorts = response.pageItems || [];
                    this.filteredDischargePorts.next(this.dischargePorts.slice());
                }
            },
            error: (err) => {
                console.error(`Error fetching ${type} ports:`, err);
                if (type === 'loading') {
                    this.loadingPorts = [];
                    this.filteredLoadingPorts.next([]);
                } else {
                    this.dischargePorts = [];
                    this.filteredDischargePorts.next([]);
                }
            }
        });
    }
}
