document.getElementById("otp").focus();

                let timer = 30;
                let resendTimer = 30;
                let timerInterval;//expire otp 60--  to 0
                let resendOtpInterval;// resend 30-- to 0


                function startTimer() {
                    timerInterval = setInterval(() => {
                        timer--;
                        document.getElementById('timerValue').textContent = `Resend OTP After ${timer} seconds`;
                        if (timer <= 0) {
                            clearInterval(timerInterval);
                            document.getElementById('timerValue').classList.add("expired");
                            document.getElementById('timerValue').textContent = "";
                            document.getElementById("resendOtpBtn").classList.replace("btn-secondary", "btn-dark");
                        }
                    }, 1000)
                }

                function startresendTimer() {// resend 30-- to 0
                    document.getElementById("resendOtpBtn").disabled = true;
                    resendOtpInterval = setTimeout(() => {
                        document.getElementById("resendOtpBtn").disabled = false;
                    }, resendTimer * 1000);
                }


                function validateOTPForm() {
                    const otpInput = document.getElementById("otp").value;


                    $.ajax({
                        type: "POST",
                        url: "verify-otp",
                        data: { otp: otpInput },
                        success: function (response) {
                            if (response.success) {
                                Swal.fire({
                                    icon: "success",
                                    title: "OTP Verified Successfully",
                                    showConfirmButton: false,
                                    timer: 1500,
                                }).then(() => {
                                    window.location.href = response.redirectUrl;
                                })
                            } else {
                                Swal.fire({
                                    icon: "error",
                                    title: "Error",
                                    text: response.message,

                                })
                            }
                        },
                        error: function () {
                            Swal.fire({
                                icon: "error",
                                title: "Invalid OTP",
                                text: "Please try again"
                            })
                        }
                    })
                    return false;
                }

                function resendOTP() {
                    clearInterval(timerInterval);

                    timer = 30;
                    document.getElementById("otp").disabled = false;
                    document.getElementById("timerValue").classList.remove("expired");
                    startTimer();
                    startresendTimer();
                    $.ajax({
                        type: "POST",
                        url: "/resend-otp",
                        success: function (response) {
                            if (response.success) {
                                Swal.fire({
                                    icon: "info",
                                    title: "OTP Resend Successfully",
                                    showConfirmButton: true,
                                    
                                })
                            } else {
                                Swal.fire({
                                    icon: "error",
                                    title: "Error",
                                    text: "An error occured while resending OTP . Please try again",
                                })
                            }
                        }
                    })
                    return false;
                }
                startTimer();
                startresendTimer();