import { Component, OnInit, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { finalize, interval, Subscription } from 'rxjs';

@Component({
    selector: 'auth-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    imports: [
        FuseAlertComponent,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        RouterLink,
    ],
})
export class AuthForgotPasswordComponent implements OnInit, OnDestroy {
    @ViewChild('forgotPasswordNgForm') forgotPasswordNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    forgotPasswordForm: UntypedFormGroup;
    showAlert: boolean = false;
    
    // Password reset state management
    resetState: 'email' | 'otp' = 'email';
    
    // OTP Resend Timer Properties
    canResendOtp: boolean = true;
    resendCooldownSeconds: number = 0;
    private resendTimerSubscription: Subscription | null = null;
    private readonly RESEND_COOLDOWN_DURATION = 300; // 5 minutes in seconds

    /**
     * Constructor
     */
    constructor(
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder
    ) {}

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.forgotPasswordForm = this._formBuilder.group({
            email: ['', [Validators.required, Validators.email]],
            otp: [''], // OTP field for verification
        });
    }

    /**
     * Lifecycle hook - cleanup subscriptions
     */
    ngOnDestroy(): void {
        if (this.resendTimerSubscription) {
            this.resendTimerSubscription.unsubscribe();
        }
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Prevent space key from being entered in email field
     */
    preventSpaceInEmail(event: KeyboardEvent): void {
        if (event.key === ' ' || event.code === 'Space' || event.keyCode === 32) {
            event.preventDefault();
        }
    }

    /**
     * Trim input field on blur or input events
     */
    trimInput(event: Event, controlName: string): void {
        const input = event.target as HTMLInputElement;
        const originalValue = input.value;
        const trimmedValue = originalValue.trim();
        
        if (originalValue !== trimmedValue) {
            // Save cursor position
            const cursorPosition = input.selectionStart || 0;
            const leadingSpaces = originalValue.length - originalValue.trimStart().length;
            
            // Update the input element value immediately
            input.value = trimmedValue;
            
            // Update form control with emitEvent to ensure validators run
            const control = this.forgotPasswordForm.get(controlName);
            if (control) {
                control.setValue(trimmedValue, { emitEvent: true });
                control.updateValueAndValidity();
            }
            
            // Restore cursor position, adjusting for removed leading spaces
            const newPosition = Math.max(0, cursorPosition - leadingSpaces);
            setTimeout(() => {
                if (input.setSelectionRange) {
                    input.setSelectionRange(newPosition, newPosition);
                }
            }, 0);
        }
    }

    /**
     * Send the reset link
     */
    sendResetLink(): void {
        // Return if the form is invalid
        if (this.forgotPasswordForm.invalid) {
            return;
        }

        // Disable the form
        this.forgotPasswordForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Forgot password
        // Trim whitespace from email
        const email = this.forgotPasswordForm.get('email').value?.trim() || '';
        
        this._authService
            .forgotPassword(email)
            .pipe(
                finalize(() => {
                    // Re-enable the form
                    this.forgotPasswordForm.enable();

                    // Reset the form
                    this.forgotPasswordNgForm.resetForm();

                    // Show the alert
                    this.showAlert = true;
                })
            )
            .subscribe(
                (response) => {
                    // Set the alert
                    this.alert = {
                        type: 'success',
                        message:
                            "OTP sent! Please check your email and enter the verification code.",
                    };
                    
                    // Transition to OTP state and start timer
                    this.resetState = 'otp';
                    this.startResendTimer();
                },
                (response) => {
                    // Set the alert
                    this.alert = {
                        type: 'error',
                        message:
                            'Email does not found! Are you sure you are already a member?',
                    };
                }
            );
    }

    /**
     * Starts the resend OTP cooldown timer
     */
    private startResendTimer(): void {
        this.canResendOtp = false;
        this.resendCooldownSeconds = this.RESEND_COOLDOWN_DURATION;
        
        // Clear any existing timer
        if (this.resendTimerSubscription) {
            this.resendTimerSubscription.unsubscribe();
        }
        
        // Start countdown timer
        this.resendTimerSubscription = interval(1000).subscribe(() => {
            this.resendCooldownSeconds--;
            
            if (this.resendCooldownSeconds <= 0) {
                this.canResendOtp = true;
                this.resendCooldownSeconds = 0;
                if (this.resendTimerSubscription) {
                    this.resendTimerSubscription.unsubscribe();
                    this.resendTimerSubscription = null;
                }
            }
        });
    }

    /**
     * Formats the countdown time for display
     */
    getFormattedCountdown(): string {
        const minutes = Math.floor(this.resendCooldownSeconds / 60);
        const seconds = this.resendCooldownSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Handles resend OTP with timer logic
     */
    resendOtp(): void {
        if (!this.canResendOtp || this.forgotPasswordForm.disabled) {
            return;
        }
        
        // Start the timer before sending OTP
        this.startResendTimer();
        
        // Call the existing sendResetLink method to resend OTP
        this.sendResetLink();
    }

    /**
     * Go back to email input state
     */
    backToEmail(): void {
        this.resetState = 'email';
        this.showAlert = false;
        this.forgotPasswordForm.get('otp')?.reset();
        
        // Reset the timer
        this.canResendOtp = true;
        this.resendCooldownSeconds = 0;
        if (this.resendTimerSubscription) {
            this.resendTimerSubscription.unsubscribe();
            this.resendTimerSubscription = null;
        }
    }

    /**
     * Verify OTP code
     */
    verifyOtp(): void {
        if (this.forgotPasswordForm.invalid) {
            return;
        }

        // Disable the form
        this.forgotPasswordForm.disable();

        // Hide the alert
        this.showAlert = false;

        const otp = this.forgotPasswordForm.get('otp')?.value;
        
        // Here you would call your OTP verification service
        // For now, we'll simulate the verification
        setTimeout(() => {
            this.forgotPasswordForm.enable();
            this.alert = {
                type: 'success',
                message: 'OTP verified successfully! You can now reset your password.',
            };
            this.showAlert = true;
            
            // You might want to redirect to reset password page here
            // this.router.navigate(['/reset-password']);
        }, 1000);
    }
}
