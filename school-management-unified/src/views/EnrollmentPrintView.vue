<template>
  <div class="print-container" :dir="isRTL ? 'rtl' : 'ltr'">
    <!-- Form Header - Exact replica from form.docx -->
    <div class="form-header">
      <!-- Top QR Section -->
      <div class="header-top">
        <div class="qr-box-left">
          <div class="qr-content">QR رمز</div>
        </div>

        <div class="center-logo">
          <!-- School Logo/Emblem Area -->
          <div class="logo-placeholder">
            <div class="logo-circle">شعار المدرسة</div>
          </div>

          <!-- School Name in Arabic -->
          <h1 class="school-name-ar">روضة زينة الحياة</h1>
          <h2 class="school-name-en">Zinat Al-Haya Kindergarten</h2>

          <!-- Contact Information -->
          <div class="contact-info">
            <p>هاتف: +968 24123456 | فاكس: +968 24123457</p>
            <p>العنوان: مسقط - سلطنة عمان</p>
            <p>البريد الإلكتروني: info@zinatalhaykindergarten.com</p>
          </div>
        </div>

        <div class="qr-box-right">
          <div class="qr-content">QR رمز</div>
        </div>
      </div>

      <!-- Contract Title Section -->
      <div class="contract-title-section">
        <div class="title-border">
          <h3 class="contract-title-ar">عقد تسجيل طالب</h3>
          <h4 class="contract-title-en">Student Registration Contract</h4>
          <div class="academic-year">للعام الدراسي 2024-2025</div>
        </div>
      </div>

      <!-- Student & Guardian Names Section -->
      <div class="names-section">
        <div class="name-row">
          <div class="name-field">
            <span class="label">اسم الطالب:</span>
            <span class="underline">{{ enrollment?.fullName || '____________________________________' }}</span>
          </div>
        </div>

        <div class="name-row">
          <div class="name-field">
            <span class="label">اسم ولي الأمر:</span>
            <span class="underline">{{ enrollment?.guardianType === 'father' ? enrollment?.fatherFullName : enrollment?.motherFullName || '____________________________________' }}</span>
          </div>
        </div>

        <div class="name-row">
          <div class="name-field">
            <span class="label">الصف:</span>
            <span class="underline">{{ enrollment?.gradeLevel || '____________________________________' }}</span>
            <span class="label margin-right">تاريخ التسجيل:</span>
            <span class="underline">{{ formatDate(enrollment?.createdAt) || '____________________' }}</span>
          </div>
        </div>
      </div>

      <!-- Declaration Section -->
      <div class="header-declaration">
        <p class="declaration-text">
          بسم الله الرحمن الرحيم، نحن إدارة روضة زينة الحياة نرحب بكم ونشكركم على ثقتكم بمؤسستنا التعليمية.
          هذا العقد يحدد الحقوق والواجبات المتبادلة بين إدارة الروضة وولي أمر الطالب/ـة.
        </p>
      </div>
    </div>

    <div v-if="enrollment" class="print-content">
      <!-- أولا: بيانات الطالب -->
      <div class="form-section student-info-section">
        <div class="section-header">
          <div class="section-number">1</div>
          <h3 class="section-title">أولا: بيانات الطالب</h3>
          <div class="section-subtitle">Student Personal Information</div>
        </div>

        <div class="section-content">
          <div class="student-info-grid">
            <!-- Photo Section -->
            <div class="photo-section">
              <div class="photo-container">
                <div class="photo-frame">
                  <div v-if="enrollment.photo" class="student-photo">
                    <img :src="enrollment.photo" alt="Student Photo" />
                  </div>
                  <div v-else class="photo-placeholder">
                    <div class="photo-icon">📷</div>
                    <div class="photo-text">صورة شخصية<br>4 x 6</div>
                  </div>
                </div>
                <div class="photo-label">صورة الطالب</div>
              </div>
            </div>

            <!-- Personal Information Grid -->
            <div class="personal-info">
              <!-- Name and Tribe -->
              <div class="info-row">
                <div class="info-field">
                  <label class="field-label">اسم الطالب الكامل:</label>
                  <div class="field-value highlighted">{{ enrollment.fullName || '____________________________________' }}</div>
                </div>
              </div>

              <div class="info-row two-columns">
                <div class="info-field">
                  <label class="field-label">القبيلة:</label>
                  <div class="field-value">{{ enrollment.tribe || '____________________' }}</div>
                </div>
                <div class="info-field">
                  <label class="field-label">الرقم المدني / جواز السفر:</label>
                  <div class="field-value">{{ enrollment.idNumber || '____________________' }}</div>
                </div>
              </div>

              <!-- Gender and Nationality -->
              <div class="info-row two-columns">
                <div class="info-field">
                  <label class="field-label">الجنس:</label>
                  <div class="gender-options">
                    <span class="option" :class="{ selected: enrollment.gender === 'male' }">
                      <span class="checkbox">{{ enrollment.gender === 'male' ? '☑' : '☐' }}</span>
                      ذكر
                    </span>
                    <span class="option" :class="{ selected: enrollment.gender === 'female' }">
                      <span class="checkbox">{{ enrollment.gender === 'female' ? '☑' : '☐' }}</span>
                      أنثى
                    </span>
                  </div>
                </div>
                <div class="info-field">
                  <label class="field-label">الجنسية:</label>
                  <div class="field-value">{{ enrollment.nationality || '____________________' }}</div>
                </div>
              </div>

              <!-- Religion -->
              <div class="info-row">
                <div class="info-field">
                  <label class="field-label">الديانة:</label>
                  <div class="field-value">{{ enrollment.religion || '____________________________________' }}</div>
                </div>
              </div>

              <!-- Birth Date Section -->
              <div class="birth-date-section">
                <div class="birth-date-header">
                  <h4>تاريخ الميلاد والعمر</h4>
                  <span class="subtitle">Date of Birth & Age</span>
                </div>

                <div class="date-age-grid">
                  <div class="date-group">
                    <div class="group-title">تاريخ الميلاد</div>
                    <div class="date-boxes">
                      <div class="date-box">
                        <div class="date-label">اليوم</div>
                        <div class="date-value">{{ formatBirthDate(enrollment.dateOfBirth, 'day') || '__' }}</div>
                      </div>
                      <div class="date-separator">/</div>
                      <div class="date-box">
                        <div class="date-label">الشهر</div>
                        <div class="date-value">{{ formatBirthDate(enrollment.dateOfBirth, 'month') || '__' }}</div>
                      </div>
                      <div class="date-separator">/</div>
                      <div class="date-box">
                        <div class="date-label">السنة</div>
                        <div class="date-value">{{ formatBirthDate(enrollment.dateOfBirth, 'year') || '____' }}</div>
                      </div>
                    </div>
                  </div>

                  <div class="age-group">
                    <div class="group-title">العمر في بداية العام الدراسي</div>
                    <div class="age-display">
                      <div class="age-value">{{ enrollment.age || '__' }}</div>
                      <div class="age-unit">سنة</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Siblings -->
              <div class="siblings-section">
                <div class="info-field">
                  <label class="field-label">يوجد أخوة للطالب بالمدرسة:</label>
                  <div class="siblings-options">
                    <span class="option" :class="{ selected: enrollment.hasSiblings }">
                      <span class="checkbox">{{ enrollment.hasSiblings ? '☑' : '☐' }}</span>
                      نعم
                    </span>
                    <span class="option" :class="{ selected: !enrollment.hasSiblings }">
                      <span class="checkbox">{{ !enrollment.hasSiblings ? '☑' : '☐' }}</span>
                      لا
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ثانيا: البيانات الدراسية -->
      <div class="form-section academic-section">
        <div class="section-header">
          <div class="section-number">2</div>
          <h3 class="section-title">ثانيا: البيانات الدراسية</h3>
          <div class="section-subtitle">Academic Information</div>
        </div>
        <div class="section-content">
          <div class="info-row">
            <div class="info-field">
              <label class="field-label">حالة القيد:</label>
              <div class="enrollment-status-options">
                <span class="option" :class="{ selected: enrollment.enrollmentStatus === 'transfer' }">
                  <span class="checkbox">{{ enrollment.enrollmentStatus === 'transfer' ? '☑' : '☐' }}</span>
                  منقول
                </span>
                <span class="option" :class="{ selected: enrollment.enrollmentStatus === 'new' }">
                  <span class="checkbox">{{ enrollment.enrollmentStatus === 'new' ? '☑' : '☐' }}</span>
                  مستجد
                </span>
              </div>
            </div>
          </div>

          <div class="info-row">
            <div class="info-field">
              <label class="field-label">الصف المراد تسجيل/ قيد الطالب / ـة به:</label>
              <div class="field-value highlighted">{{ enrollment.gradeLevel || '________________' }}</div>
            </div>
          </div>

          <div class="info-row">
            <div class="info-field">
              <label class="field-label">اسم المدرسة المنقول منها الطالب/ ـة:</label>
              <div class="field-value">{{ enrollment.previousSchool || '________________' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ثالثا: البيانات الصحية -->
      <div class="form-section health-section">
        <div class="section-header">
          <div class="section-number">3</div>
          <h3 class="section-title">ثالثا: البيانات الصحية</h3>
          <div class="section-subtitle">Health Information</div>
        </div>
        <div class="section-content">
          <div class="health-subtitle">التفاصيل الطبية للطالب / ـة بما فيها الأمراض المزمنة التي يجب على المدرسة معرفتها</div>

          <div class="health-conditions">
            <div class="condition-group">
              <span class="option" :class="{ selected: enrollment.allergies }">
                <span class="checkbox">{{ enrollment.allergies ? '☑' : '☐' }}</span>
                الحساسية
              </span>
              <span class="option" :class="{ selected: enrollment.seizures }">
                <span class="checkbox">{{ enrollment.seizures ? '☑' : '☐' }}</span>
                نوبات صرع
              </span>
              <span class="option" :class="{ selected: enrollment.surgeries }">
                <span class="checkbox">{{ enrollment.surgeries ? '☑' : '☐' }}</span>
                عملية جراحية تستوجب الانتباه
              </span>
            </div>

            <div class="condition-group">
              <span class="option" :class="{ selected: enrollment.chronicDiseases }">
                <span class="checkbox">{{ enrollment.chronicDiseases ? '☑' : '☐' }}</span>
                أمراض مزمنة (الضغط، السكري، الربو، الأنيميا...)
              </span>
            </div>

            <div class="info-row">
              <div class="info-field">
                <label class="field-label">أخرى:</label>
                <div class="field-value">{{ enrollment.otherHealthInfo || '________________' }}</div>
              </div>
            </div>

            <div class="medical-note">* مع ضرورة إرفاق التقارير الطبية</div>
          </div>

          <!-- Health details -->
          <div v-if="enrollment.allergiesDetails || enrollment.seizuresDetails || enrollment.surgeriesDetails || enrollment.chronicDiseasesDetails" class="health-details-section">
            <div v-if="enrollment.allergiesDetails" class="health-detail">
              <strong>تفاصيل الحساسية:</strong> {{ enrollment.allergiesDetails }}
            </div>
            <div v-if="enrollment.seizuresDetails" class="health-detail">
              <strong>تفاصيل نوبات الصرع:</strong> {{ enrollment.seizuresDetails }}
            </div>
            <div v-if="enrollment.surgeriesDetails" class="health-detail">
              <strong>تفاصيل العمليات الجراحية:</strong> {{ enrollment.surgeriesDetails }}
            </div>
            <div v-if="enrollment.chronicDiseasesDetails" class="health-detail">
              <strong>تفاصيل الأمراض المزمنة:</strong> {{ enrollment.chronicDiseasesDetails }}
            </div>
          </div>
        </div>
      </div>

      <!-- رابعا: بيانات ولي أمر الطالب -->
      <div class="form-section guardian-section">
        <div class="section-header">
          <div class="section-number">4</div>
          <h3 class="section-title">رابعا: بيانات ولي أمر الطالب</h3>
          <div class="section-subtitle">Guardian Information</div>
        </div>
        <div class="section-content">
          <div class="guardian-subtitle">يقصد بكلمة ولي أمر الطالب الشخص المسؤول عن رعاية الطالب وتربيته كالولي والوصي والحاضن والجهات المنوطة بها الرعاية البديلة</div>

          <div class="info-row">
            <div class="info-field">
              <label class="field-label">ولي الأمر:</label>
              <div class="guardian-type-options">
                <span class="option" :class="{ selected: enrollment.guardianType === 'father' }">
                  <span class="checkbox">{{ enrollment.guardianType === 'father' ? '☑' : '☐' }}</span>
                  الأب
                </span>
                <span class="option" :class="{ selected: enrollment.guardianType === 'mother' }">
                  <span class="checkbox">{{ enrollment.guardianType === 'mother' ? '☑' : '☐' }}</span>
                  الأم
                </span>
                <span class="option" :class="{ selected: enrollment.guardianType === 'other' }">
                  <span class="checkbox">{{ enrollment.guardianType === 'other' ? '☑' : '☐' }}</span>
                  جهة أخرى
                </span>
              </div>
            </div>
          </div>

          <!-- Father Information -->
          <div class="guardian-details father-details">
            <h4 class="guardian-title">معلومات الأب</h4>
            <div class="info-row two-columns">
              <div class="info-field">
                <label class="field-label">اسم الأب الثلاثي:</label>
                <div class="field-value">{{ enrollment.fatherFullName || '________________' }}</div>
              </div>
              <div class="info-field">
                <label class="field-label">القبيلة:</label>
                <div class="field-value">{{ enrollment.fatherTribe || '________________' }}</div>
              </div>
            </div>
            <div class="info-row two-columns">
              <div class="info-field">
                <label class="field-label">مكان العمل:</label>
                <div class="field-value">{{ enrollment.fatherWorkplace || '________________' }}</div>
              </div>
              <div class="info-field">
                <label class="field-label">هاتف العمل:</label>
                <div class="field-value">{{ enrollment.fatherWorkPhone || '________________' }}</div>
              </div>
            </div>
            <div class="info-row two-columns">
              <div class="info-field">
                <label class="field-label">الهاتف النقال:</label>
                <div class="field-value">{{ enrollment.fatherMobile || '________________' }}</div>
              </div>
              <div class="info-field">
                <label class="field-label">البريد الإلكتروني:</label>
                <div class="field-value">{{ enrollment.fatherEmail || '________________' }}</div>
              </div>
            </div>
            <div class="info-row">
              <div class="info-field">
                <label class="field-label">الحالة الاجتماعية:</label>
                <div class="field-value">{{ enrollment.fatherMaritalStatus || '________________' }}</div>
              </div>
            </div>
          </div>

          <!-- Mother Information -->
          <div class="guardian-details mother-details">
            <h4 class="guardian-title">معلومات الأم</h4>
            <div class="info-row two-columns">
              <div class="info-field">
                <label class="field-label">اسم الأم الثلاثي:</label>
                <div class="field-value">{{ enrollment.motherFullName || '________________' }}</div>
              </div>
              <div class="info-field">
                <label class="field-label">القبيلة/اللقب:</label>
                <div class="field-value">{{ enrollment.motherTribe || '________________' }}</div>
              </div>
            </div>
            <div class="info-row two-columns">
              <div class="info-field">
                <label class="field-label">مكان العمل:</label>
                <div class="field-value">{{ enrollment.motherWorkplace || '________________' }}</div>
              </div>
              <div class="info-field">
                <label class="field-label">هاتف العمل:</label>
                <div class="field-value">{{ enrollment.motherWorkPhone || '________________' }}</div>
              </div>
            </div>
            <div class="info-row two-columns">
              <div class="info-field">
                <label class="field-label">الهاتف النقال:</label>
                <div class="field-value">{{ enrollment.motherMobile || '________________' }}</div>
              </div>
              <div class="info-field">
                <label class="field-label">البريد الإلكتروني:</label>
                <div class="field-value">{{ enrollment.motherEmail || '________________' }}</div>
              </div>
            </div>
            <div class="info-row">
              <div class="info-field">
                <label class="field-label">الحالة الاجتماعية:</label>
                <div class="field-value">{{ enrollment.motherMaritalStatus || '________________' }}</div>
              </div>
            </div>
          </div>

          <!-- Organization Information (if other) -->
          <div v-if="enrollment.guardianType === 'other'" class="guardian-details organization-details">
            <h4 class="guardian-title">معلومات الجهة</h4>
            <div class="info-row two-columns">
              <div class="info-field">
                <label class="field-label">إسم الجهة:</label>
                <div class="field-value">{{ enrollment.organizationName || '________________' }}</div>
              </div>
              <div class="info-field">
                <label class="field-label">الهاتف:</label>
                <div class="field-value">{{ enrollment.organizationPhone || '________________' }}</div>
              </div>
            </div>
            <div class="info-row two-columns">
              <div class="info-field">
                <label class="field-label">اسم المسؤول:</label>
                <div class="field-value">{{ enrollment.responsiblePerson || '________________' }}</div>
              </div>
              <div class="info-field">
                <label class="field-label">هاتف المسؤول:</label>
                <div class="field-value">{{ enrollment.responsiblePhone || '________________' }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- خامسا: بيانات الشخص / الجهة التي يرجع لها عند عدم توفر ولي الأمر -->
      <div class="form-section emergency-section">
        <div class="section-header">
          <div class="section-number">5</div>
          <h3 class="section-title">خامسا: بيانات الشخص / الجهة التي يرجع لها عند عدم توفر ولي الأمر</h3>
          <div class="section-subtitle">Emergency Contact</div>
        </div>
        <div class="section-content">
          <div class="info-row two-columns">
            <div class="info-field">
              <label class="field-label">الاسم الثلاثي:</label>
              <div class="field-value">{{ enrollment.emergencyContactName || '________________' }}</div>
            </div>
            <div class="info-field">
              <label class="field-label">القبيلة/اللقب:</label>
              <div class="field-value">{{ enrollment.emergencyContactTribe || '________________' }}</div>
            </div>
          </div>
          <div class="info-row two-columns">
            <div class="info-field">
              <label class="field-label">مكان العمل:</label>
              <div class="field-value">{{ enrollment.emergencyContactWorkplace || '________________' }}</div>
            </div>
            <div class="info-field">
              <label class="field-label">هاتف العمل:</label>
              <div class="field-value">{{ enrollment.emergencyContactWorkPhone || '________________' }}</div>
            </div>
          </div>
          <div class="info-row two-columns">
            <div class="info-field">
              <label class="field-label">الهاتف النقال:</label>
              <div class="field-value">{{ enrollment.emergencyContactMobile || '________________' }}</div>
            </div>
            <div class="info-field">
              <label class="field-label">صلة القرابة:</label>
              <div class="field-value">{{ enrollment.emergencyContactRelationship || '________________' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- سادسا: بيانات السكن -->
      <div class="form-section address-section">
        <div class="section-header">
          <div class="section-number">6</div>
          <h3 class="section-title">سادسا: بيانات السكن</h3>
          <div class="section-subtitle">Address Information</div>
        </div>
        <div class="section-content">
          <div class="info-row two-columns">
            <div class="info-field">
              <label class="field-label">المنطقة/ الولاية:</label>
              <div class="field-value">{{ enrollment.area || '________________' }}</div>
            </div>
            <div class="info-field">
              <label class="field-label">القرية:</label>
              <div class="field-value">{{ enrollment.village || '________________' }}</div>
            </div>
          </div>
          <div class="info-row three-columns">
            <div class="info-field">
              <label class="field-label">معلم مشهور:</label>
              <div class="field-value">{{ enrollment.landmark || '________________' }}</div>
            </div>
            <div class="info-field">
              <label class="field-label">رقم الشارع:</label>
              <div class="field-value">{{ enrollment.streetNumber || '________________' }}</div>
            </div>
            <div class="info-field">
              <label class="field-label">رقم السكة:</label>
              <div class="field-value">{{ enrollment.alleyNumber || '________________' }}</div>
            </div>
          </div>
          <div class="info-row">
            <div class="info-field">
              <label class="field-label">رقم المبنى (المنزل/الشقة):</label>
              <div class="field-value">{{ enrollment.buildingNumber || '________________' }}</div>
            </div>
          </div>
          <div class="info-row">
            <div class="info-field">
              <label class="field-label">نوع السكن:</label>
              <div class="housing-type-options">
                <span class="option" :class="{ selected: enrollment.housingType === 'house' }">
                  <span class="checkbox">{{ enrollment.housingType === 'house' ? '☑' : '☐' }}</span>
                  منزل
                </span>
                <span class="option" :class="{ selected: enrollment.housingType === 'apartment' }">
                  <span class="checkbox">{{ enrollment.housingType === 'apartment' ? '☑' : '☐' }}</span>
                  شقة
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- سابعا: الرسوم الدراسية ورسوم الخدمات الأخرى -->
      <div class="form-section fees-section">
        <div class="section-header">
          <div class="section-number">7</div>
          <h3 class="section-title">سابعا: الرسوم الدراسية ورسوم الخدمات الأخرى</h3>
          <div class="section-subtitle">Fees & Payment Schedule</div>
        </div>
        <div class="section-content">
          <div class="fees-table">
            <table>
              <thead>
                <tr>
                  <th>المرحلة/الصف</th>
                  <th>البرنامج التعليمي<br>(احادي اللغة/ ثنائي اللغة/ دولي)</th>
                  <th>رسوم<br>التسجيل</th>
                  <th>الرسوم<br>الدراسية</th>
                  <th>رسوم<br>الكتب</th>
                  <th>رسوم<br>النقل</th>
                  <th>رسوم التغذية</th>
                  <th>رسوم<br>الزي المدرسي</th>
                  <th>اجمالي<br>الرسوم</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{{ enrollment.gradeLevel || 'روضة' }}</td>
                  <td>المنهج العماني المطور</td>
                  <td>70</td>
                  <td>500</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>-</td>
                  <td>570</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="fees-notes">
            <p><strong>ملاحظة:</strong> توفر الروضة لبسين لكل عبقري ، في حالة طلب ملابس أخرى يتم دفع رسوم إضافية 10 ريال عن كل لبس إضافي</p>
            <p class="indent">يتم إضافة رسوم الكتب 30 ريال في حال استخدام منهج القارئ العبقري للقراءة (قيمة الباقة كاملة للعبقري)</p>
          </div>

          <div class="payment-schedule">
            <h4>آلية تحصيل الرسوم الدراسية والرسوم الاخرى</h4>
            <table>
              <thead>
                <tr>
                  <th>الدفعات</th>
                  <th>النسبة %</th>
                  <th>المبلغ</th>
                  <th>موعد السداد</th>
                  <th>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>الدفعة المقدمة</td>
                  <td></td>
                  <td>70</td>
                  <td>قبل موعد الدراسة</td>
                  <td>تشمل لبسين ودفتر والمنهج (عدا منهج القارئ العبقري)</td>
                </tr>
                <tr>
                  <td>الدفعة الأولى</td>
                  <td></td>
                  <td>56</td>
                  <td>شهر سبتمبر</td>
                  <td></td>
                </tr>
                <tr>
                  <td>الدفعة الثانية</td>
                  <td></td>
                  <td>56</td>
                  <td>شهر أكتوبر</td>
                  <td></td>
                </tr>
                <tr>
                  <td>الدفعة الثالثة</td>
                  <td></td>
                  <td>56</td>
                  <td>شهر نوفمبر</td>
                  <td></td>
                </tr>
                <tr>
                  <td>الدفعة الرابعة</td>
                  <td></td>
                  <td>56</td>
                  <td>شهر ديسمبر</td>
                  <td></td>
                </tr>
                <tr>
                  <td>الدفعة الخامسة</td>
                  <td></td>
                  <td>56</td>
                  <td>شهر يناير</td>
                  <td></td>
                </tr>
                <tr>
                  <td>الدفعة السادسة</td>
                  <td></td>
                  <td>56</td>
                  <td>شهر فبراير</td>
                  <td></td>
                </tr>
                <tr>
                  <td>الدفعة السابعة</td>
                  <td></td>
                  <td>56</td>
                  <td>شهر مارس</td>
                  <td></td>
                </tr>
                <tr>
                  <td>الدفعة الثامنة</td>
                  <td></td>
                  <td>56</td>
                  <td>شهر إبريل</td>
                  <td></td>
                </tr>
                <tr>
                  <td>الدفعة التاسعة</td>
                  <td></td>
                  <td>52</td>
                  <td>شهر مايو</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- مسؤولية المدرسة تجاه الطالب/ـة وولي أمره -->
      <div class="form-section responsibilities-section">
        <div class="section-header">
          <div class="section-number">8</div>
          <h3 class="section-title">مسؤولية المدرسة تجاه الطالب/ـة وولي أمره</h3>
          <div class="section-subtitle">School Responsibilities</div>
        </div>
        <div class="section-content">
          <div class="responsibilities-subtitle">(تذكر بالتفصيل)</div>
          <div class="responsibilities-list">
            <div class="responsibility-item">
              <span class="checkbox">☑</span>
              الالتزام بما ورد في قانون التعليم المدرسي الصادر بالمرسوم السلطاني (٣١/ ٢٠٢٣).
            </div>
            <div class="responsibility-item">
              <span class="checkbox">☑</span>
              توفير الخدمة التعليمية للطالب/ـة وفق اشتراطات الوزارة.
            </div>
            <div class="responsibility-item">
              <span class="checkbox">☑</span>
              توفير البيئة التعليمية الآمنة (الأمن والسلامة/حماية الطالب).
            </div>
            <div class="responsibility-item">
              <span class="checkbox">☑</span>
              السماح لولي أمر الطالب/ـة بالاطلاع على كل ما يتعلق بالمستوى التحصيلي، والسلوك الأخلاقي للطالب.
            </div>
            <div class="responsibility-item">
              <span class="checkbox">☑</span>
              تمكين ولي الأمر من الاطلاع على سياسة المدرسة، وقوانينها، وأنظمتها وما يتم من التحديث لها.
            </div>
          </div>
        </div>
      </div>

      <!-- مسؤولية ولي أمر الطالب تجاه المدرسة -->
      <div class="form-section parent-responsibilities-section">
        <div class="section-header">
          <div class="section-number">9</div>
          <h3 class="section-title">مسؤولية ولي أمر الطالب تجاه المدرسة</h3>
          <div class="section-subtitle">Parent Responsibilities</div>
        </div>
        <div class="section-content">
          <div class="responsibilities-subtitle">(تذكر بالتفصيل)</div>
          <div class="responsibilities-list">
            <div class="responsibility-item">
              <span class="checkbox">☑</span>
              الالتزام بما ورد في قانون التعليم المدرسي الصادر بالمرسوم السلطاني (٣١/ ٢٠٢٣).
            </div>
            <div class="responsibility-item">
              <span class="checkbox">☑</span>
              الالتزام بدفع الرسوم الدراسية والرسوم الأخرى وفق المواعيد المقررة بالعقد.
            </div>
            <div class="responsibility-item">
              <span class="checkbox">☑</span>
              احترام القوانين واللوائح المنظمة للعمل بالمدرسة.
            </div>
          </div>
        </div>
      </div>

      <!-- المستندات المطلوبة -->
      <div class="form-section documents-section">
        <div class="section-header">
          <div class="section-number">10</div>
          <h3 class="section-title">المستندات المطلوبة</h3>
          <div class="section-subtitle">Required Documents</div>
        </div>
        <div class="section-content">
          <div class="documents-list">
            <div class="document-item">
              <span class="checkbox">☑</span>
              نسخة من شهادة الميلاد.
            </div>
            <div class="document-item">
              <span class="checkbox">☑</span>
              نسخة من جواز سفر الطالب / البطاقة الشخصية للعمانيين.
            </div>
            <div class="document-item">
              <span class="checkbox">☑</span>
              نسخة من بطاقة الإقامة للطالب (لغير العمانيين).
            </div>
            <div class="document-item">
              <span class="checkbox">☑</span>
              نسخة من البطاقة الشخصية لولي أمر الطالب (للعمانيين) / بطاقة الإقامة لولي أمر الطالب (لغير العمانيين).
            </div>
            <div class="document-item">
              <span class="checkbox">☑</span>
              نسخة من السجل الصحي للطالب (صفحة التطعيمات).
            </div>
            <div class="document-item">
              <span class="checkbox">☑</span>
              4 صور شخصية للطالب.
            </div>
            <div class="document-item">
              <span class="checkbox">☑</span>
              المستندات الثبوتية في حالة(الحضانة أو الوصاية...الخ)
            </div>
          </div>
        </div>
      </div>

      <!-- إقرار وتعهد -->
      <div class="form-section declaration-section">
        <div class="section-header">
          <div class="section-number">11</div>
          <h3 class="section-title">إقرار وتعهد</h3>
          <div class="section-subtitle">Declaration & Commitment</div>
        </div>
        <div class="section-content">
          <p class="declaration-text">
            نقر نحن الموقعين أدناه بالالتزام الكامل ببنود العقد، ولنا الحق في اتخاذ الاجراءات القانونية في حال عدم التزام الطرف الاخر بهذا العقد، وعلى ذلك جرى توقيعنا عليه.
          </p>

          <div class="signature-boxes">
            <div class="signature-box">
              <div class="party-title">الطرف الأول:</div>
              <div class="signature-field">
                <span class="field-label">اسم مدير المدرسة:</span>
                <span class="field-line">_________________________</span>
              </div>
              <div class="signature-field">
                <span class="field-label">التوقيع:</span>
                <span class="field-line">_______________________________</span>
              </div>
              <div class="signature-field">
                <span class="field-label">التاريخ:</span>
                <span class="field-line">_______________________________</span>
              </div>
            </div>

            <div class="signature-box">
              <div class="party-title">الطرف الثاني:</div>
              <div class="signature-field">
                <span class="field-label">اسم ولي أمر الطالب:</span>
                <span class="field-line">{{ enrollment.guardianType === 'father' ? enrollment.fatherFullName : enrollment.motherFullName || '_________________________' }}</span>
              </div>
              <div class="signature-field">
                <span class="field-label">التوقيع:</span>
                <span class="field-line">_____________________________</span>
              </div>
              <div class="signature-field">
                <span class="field-label">التاريخ:</span>
                <span class="field-line">_____________________________</span>
              </div>
            </div>
          </div>

          <div class="seal-section">
            <div class="seal-box">
              الختم
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Print Footer -->
    <div class="print-footer">
      <div class="print-date">
        طبع في: {{ formatDate(new Date().toISOString()) }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { enrollmentService } from '@/services/enrollment.service'
import type { Enrollment } from '@/services/enrollment.service'

const route = useRoute()
const { locale, t } = useI18n()

const enrollment = ref<Enrollment | null>(null)
const loading = ref(false)

const isRTL = computed(() => locale.value === 'ar')

const loadEnrollment = async () => {
  try {
    loading.value = true
    const id = route.params.id as string
    enrollment.value = await enrollmentService.getEnrollment(id)

    // Trigger print dialog after data loads
    setTimeout(() => {
      window.print()
    }, 500)
  } catch (error) {
    console.error('Failed to load enrollment:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value === 'ar' ? 'ar-AE' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatBirthDate = (dateString: string | undefined, part: 'day' | 'month' | 'year') => {
  if (!dateString) return ''
  const date = new Date(dateString)
  switch (part) {
    case 'day':
      return date.getDate().toString().padStart(2, '0')
    case 'month':
      return (date.getMonth() + 1).toString().padStart(2, '0')
    case 'year':
      return date.getFullYear().toString()
    default:
      return ''
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'status-pending'
    case 'approved':
      return 'status-approved'
    case 'rejected':
      return 'status-rejected'
    case 'enrolled':
      return 'status-enrolled'
    default:
      return 'status-default'
  }
}

onMounted(() => {
  loadEnrollment()
})
</script>

<style scoped>
/* Print-specific styles */
@media print {
  .print-container {
    margin: 0;
    padding: 0;
    box-shadow: none;
    background: white;
  }

  .form-section {
    break-inside: avoid;
    page-break-inside: avoid;
  }
}

/* General styles */
.print-container {
  max-width: 21cm;
  margin: 0 auto;
  padding: 1cm;
  background: white;
  font-family: 'Times New Roman', serif;
  font-size: 14px;
  line-height: 1.2;
  color: #000;
  direction: rtl;
  text-align: right;
}

/* Professional Header Section - Matching Original Form */
.form-header {
  border: 3px solid #000;
  padding: 20px;
  margin-bottom: 30px;
  background: white;
  page-break-inside: avoid;
}

/* Header Top Section */
.header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 30px;
}

.qr-box-left,
.qr-box-right {
  border: 2px solid #000;
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  text-align: center;
  font-weight: bold;
}

.center-logo {
  flex: 1;
  text-align: center;
  margin: 0 20px;
}

.logo-placeholder {
  margin-bottom: 15px;
}

.logo-circle {
  border: 2px solid #000;
  border-radius: 50%;
  width: 80px;
  height: 80px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: bold;
  background: #f8f9fa;
}

.school-name-ar {
  font-size: 24px;
  font-weight: bold;
  margin: 10px 0 5px 0;
  color: #000;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.school-name-en {
  font-size: 18px;
  margin: 0 0 15px 0;
  color: #333;
  font-weight: normal;
  font-style: italic;
}

.contact-info {
  font-size: 11px;
  line-height: 1.4;
  color: #555;
}

.contact-info p {
  margin: 2px 0;
}

/* Contract Title Section */
.contract-title-section {
  text-align: center;
  margin: 25px 0;
}

.title-border {
  border: 2px solid #000;
  padding: 15px;
  margin: 0 auto;
  max-width: 500px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.contract-title-ar {
  font-size: 22px;
  font-weight: bold;
  margin: 0;
  color: #000;
  text-decoration: underline;
}

.contract-title-en {
  font-size: 16px;
  margin: 5px 0 10px 0;
  color: #333;
  font-weight: normal;
  font-style: italic;
}

.academic-year {
  font-size: 14px;
  font-weight: bold;
  color: #000;
  margin-top: 8px;
  border-top: 1px solid #000;
  padding-top: 8px;
}

/* Names Section */
.names-section {
  margin: 25px 0;
  padding: 15px;
  border: 1px solid #000;
  background: #fafafa;
}

.name-row {
  margin: 12px 0;
  line-height: 2.0;
}

.name-field {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.name-field .label {
  font-weight: bold;
  font-size: 14px;
  margin-left: 10px;
  min-width: fit-content;
}

.name-field .underline {
  border-bottom: 2px solid #000;
  min-height: 25px;
  display: inline-block;
  flex: 1;
  min-width: 200px;
  padding: 2px 8px;
  font-size: 14px;
  font-weight: normal;
}

.margin-right {
  margin-right: 30px;
}

/* Header Declaration */
.header-declaration {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #000;
  background: #f0f8ff;
  text-align: justify;
}

.header-declaration .declaration-text {
  font-size: 13px;
  line-height: 1.8;
  margin: 0;
  color: #000;
  text-align: justify;
  font-style: italic;
}

/* School Branding Colors */
:root {
  --primary-color: #2c3e50;    /* Dark blue-gray */
  --secondary-color: #e74c3c;  /* Red accent */
  --accent-color: #3498db;     /* Light blue */
  --success-color: #27ae60;    /* Green */
  --warning-color: #f39c12;    /* Orange */
  --light-bg: #f8f9fa;
  --border-color: #dee2e6;
  --text-color: #2c3e50;
}

/* Enhanced Form Sections */
.form-section {
  margin-bottom: 30px;
  border: 2px solid var(--primary-color);
  border-radius: 8px;
  background: white;
  box-shadow: 0 2px 8px rgba(44, 62, 80, 0.1);
  overflow: hidden;
}

.student-info-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.academic-section {
  background: linear-gradient(135deg, #e8f4fd 0%, #ffffff 100%);
}

.health-section {
  background: linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%);
}

.guardian-section {
  background: linear-gradient(135deg, #fdf2e9 0%, #ffffff 100%);
}

.emergency-section {
  background: linear-gradient(135deg, #fff3e0 0%, #ffffff 100%);
}

.address-section {
  background: linear-gradient(135deg, #f3e5f5 0%, #ffffff 100%);
}

.fees-section {
  background: linear-gradient(135deg, #e1f5fe 0%, #ffffff 100%);
}

.responsibilities-section {
  background: linear-gradient(135deg, #f1f8e9 0%, #ffffff 100%);
}

.parent-responsibilities-section {
  background: linear-gradient(135deg, #fce4ec 0%, #ffffff 100%);
}

.documents-section {
  background: linear-gradient(135deg, #e8eaf6 0%, #ffffff 100%);
}

.declaration-section {
  background: linear-gradient(135deg, #fff8e1 0%, #ffffff 100%);
}

/* Section Header */
.section-header {
  background: linear-gradient(135deg, var(--primary-color) 0%, #34495e 100%);
  color: white;
  padding: 15px 20px;
  position: relative;
  display: flex;
  align-items: center;
  gap: 15px;
}

.section-number {
  background: var(--secondary-color);
  color: white;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
  box-shadow: 0 2px 4px rgba(231, 76, 60, 0.3);
  border: 2px solid white;
}

.section-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  color: white;
  flex: 1;
}

.section-subtitle {
  font-size: 12px;
  color: #bdc3c7;
  font-style: italic;
  margin-left: auto;
}

.section-content {
  padding: 25px;
}

/* Student Info Grid Layout */
.student-info-grid {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 30px;
  align-items: start;
}

.photo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.personal-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* Enhanced Photo Section */
.photo-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.photo-container {
  text-align: center;
}

.photo-frame {
  border: 3px solid var(--primary-color);
  border-radius: 8px;
  width: 150px;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  box-shadow: 0 4px 8px rgba(44, 62, 80, 0.15);
  overflow: hidden;
  position: relative;
  transition: all 0.2s ease;
}

.photo-frame:hover {
  transform: scale(1.02);
  box-shadow: 0 6px 12px rgba(44, 62, 80, 0.2);
}

.photo-placeholder {
  text-align: center;
  color: #7f8c8d;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.photo-icon {
  font-size: 36px;
  opacity: 0.7;
}

.photo-text {
  font-size: 11px;
  line-height: 1.3;
  font-weight: 500;
}

.photo-label {
  margin-top: 10px;
  font-size: 12px;
  font-weight: bold;
  color: var(--primary-color);
  text-align: center;
  padding: 5px 10px;
  background: linear-gradient(135deg, var(--light-bg) 0%, #ffffff 100%);
  border-radius: 15px;
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.student-photo img {
  max-width: 144px;
  max-height: 194px;
  object-fit: cover;
  border-radius: 5px;
}

/* Personal Information Layout */
.personal-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
}

.info-row.three-columns {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}

.info-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 13px;
  font-weight: bold;
  color: var(--primary-color);
  margin: 0;
}

.field-value {
  border: 1px solid var(--border-color);
  border-bottom: 2px solid var(--primary-color);
  padding: 8px 12px;
  font-size: 14px;
  min-height: 20px;
  background: #ffffff;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.field-value:hover {
  border-color: var(--accent-color);
}

.field-value.highlighted {
  background: linear-gradient(135deg, #fff3cd 0%, #fffbf0 100%);
  border-color: var(--warning-color);
  font-weight: bold;
  color: var(--primary-color);
  box-shadow: 0 2px 4px rgba(243, 156, 18, 0.2);
}

/* Gender and Options Styling */
.gender-options,
.siblings-options {
  display: flex;
  gap: 20px;
  padding: 8px;
}

.option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  border: 1px solid #bdc3c7;
  border-radius: 20px;
  background: #ffffff;
  transition: all 0.3s ease;
  cursor: default;
}

.option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 15px;
  border: 1px solid #bdc3c7;
  border-radius: 20px;
  background: #ffffff;
  transition: all 0.3s ease;
  cursor: default;
}

.option.selected {
  background: var(--success-color);
  color: white;
  border-color: #219a52;
  box-shadow: 0 2px 4px rgba(39, 174, 96, 0.3);
  transform: scale(1.02);
}

.enrollment-status-options,
.guardian-type-options,
.housing-type-options {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  padding: 8px;
}

.option .checkbox {
  font-size: 14px;
  font-weight: bold;
}

/* Birth Date Section */
.birth-date-section {
  background: linear-gradient(135deg, var(--light-bg) 0%, #ffffff 100%);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  margin: 15px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.birth-date-header {
  text-align: center;
  margin-bottom: 20px;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 10px;
}

.birth-date-header h4 {
  font-size: 16px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 5px 0;
}

.birth-date-header .subtitle {
  font-size: 12px;
  color: #7f8c8d;
  font-style: italic;
}

.date-age-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 30px;
  align-items: start;
}

.date-group {
  text-align: center;
}

.group-title {
  font-size: 13px;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 15px;
}

.date-boxes {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.date-box {
  border: 2px solid var(--primary-color);
  border-radius: 6px;
  width: 50px;
  height: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  box-shadow: 0 2px 4px rgba(44, 62, 80, 0.15);
  transition: all 0.2s ease;
}

.date-box:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(44, 62, 80, 0.2);
}

.date-label {
  font-size: 10px;
  font-weight: bold;
  color: #7f8c8d;
  margin-bottom: 5px;
}

.date-value {
  font-size: 14px;
  font-weight: bold;
  color: #2c3e50;
}

.date-separator {
  font-size: 18px;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 5px;
}

/* Age Display */
.age-group {
  text-align: center;
}

.age-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  background: white;
  border: 2px solid var(--secondary-color);
  border-radius: 12px;
  padding: 15px 20px;
  box-shadow: 0 3px 6px rgba(231, 76, 60, 0.2);
}

.age-value {
  font-size: 28px;
  font-weight: bold;
  color: var(--secondary-color);
}

.age-unit {
  font-size: 14px;
  font-weight: bold;
  color: var(--primary-color);
}


/* Siblings Section */
.siblings-section {
  background: linear-gradient(135deg, #e8f5e8 0%, #f8fff8 100%);
  border: 1px solid var(--success-color);
  border-radius: 8px;
  padding: 15px;
  margin-top: 10px;
  box-shadow: 0 2px 4px rgba(39, 174, 96, 0.1);
}

/* Additional Section Styling */
.health-subtitle,
.guardian-subtitle,
.responsibilities-subtitle {
  font-size: 12px;
  color: #6c757d;
  font-style: italic;
  margin-bottom: 15px;
  padding: 8px 15px;
  background: rgba(108, 117, 125, 0.1);
  border-radius: 4px;
  border-left: 3px solid var(--primary-color);
}

.guardian-details {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  margin: 15px 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.guardian-title {
  font-size: 16px;
  font-weight: bold;
  color: var(--primary-color);
  margin-bottom: 15px;
  padding-bottom: 8px;
  border-bottom: 2px solid var(--secondary-color);
  display: inline-block;
}

.father-details {
  border-left: 4px solid #3498db;
}

.mother-details {
  border-left: 4px solid #e91e63;
}

.organization-details {
  border-left: 4px solid #9c27b0;
}

.health-conditions {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.condition-group {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.medical-note {
  font-size: 11px;
  color: var(--secondary-color);
  font-style: italic;
  margin-top: 10px;
  padding: 8px 12px;
  background: #fff5f5;
  border: 1px solid #ffebee;
  border-radius: 4px;
  border-left: 3px solid var(--secondary-color);
}

.health-details-section {
  margin-top: 20px;
  padding: 15px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 1px solid var(--border-color);
  border-radius: 8px;
}

.health-detail {
  margin: 10px 0;
  padding: 8px 12px;
  background: #ffffff;
  border: 1px solid #e9ecef;
  border-radius: 4px;
  border-left: 3px solid var(--accent-color);
  font-size: 13px;
}

/* Student Section Layout */
.photo-section {
  float: left;
  margin-left: 20px;
  margin-bottom: 15px;
}

.photo-container {
  text-align: center;
}

.photo-frame {
  border: 1px solid #000;
  width: 120px;
  height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.photo-placeholder {
  font-size: 10px;
  text-align: center;
  line-height: 1.2;
}

.student-photo img {
  max-width: 118px;
  max-height: 138px;
  object-fit: cover;
}

.student-details {
  margin-right: 140px;
}


.gender-label {
  margin-right: 20px;
}

.checkbox-group {
  margin-right: 10px;
}


/* Date Section */
.date-section {
  display: flex;
  gap: 30px;
  margin: 15px 0;
  clear: both;
}

.date-group {
  flex: 1;
}

.date-title {
  font-weight: bold;
  text-align: center;
  margin-bottom: 10px;
  font-size: 13px;
}

.date-boxes {
  display: flex;
  gap: 10px;
  justify-content: center;
}

.date-box {
  border: 1px solid #000;
  width: 60px;
  height: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 5px;
}

.date-label {
  font-size: 10px;
  font-weight: bold;
}

.date-value {
  font-size: 12px;
  font-weight: bold;
}

/* Siblings Section */
.siblings-section {
  margin-top: 15px;
  clear: both;
}

/* Health Section */
.health-checkboxes {
  margin-bottom: 10px;
  line-height: 1.8;
}

.health-details {
  margin: 10px 0;
  padding: 5px;
  background: #f9f9f9;
  border: 1px solid #ddd;
  font-size: 12px;
}

.note {
  font-size: 11px;
  font-style: italic;
  margin-right: 10px;
}

/* Guardian Information */
.guardian-info {
  margin: 15px 0;
  padding: 10px;
  border: 1px solid #ccc;
  background: #fafafa;
}

/* Fees Tables */
.fees-table table,
.payment-schedule table {
  width: 100%;
  border-collapse: collapse;
  margin: 15px 0;
  font-size: 12px;
}

.fees-table th,
.fees-table td,
.payment-schedule th,
.payment-schedule td {
  border: 1px solid #000;
  padding: 8px 5px;
  text-align: center;
  vertical-align: middle;
}

.fees-table th,
.payment-schedule th {
  background: #f0f0f0;
  font-weight: bold;
  font-size: 11px;
}

.fees-notes {
  margin: 15px 0;
  font-size: 12px;
  line-height: 1.5;
}

.fees-notes .indent {
  margin-right: 20px;
}

.payment-schedule h4 {
  text-align: center;
  margin: 20px 0 10px 0;
  font-size: 14px;
  text-decoration: underline;
}

/* Responsibilities Lists */
.responsibilities-list {
  margin: 15px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.responsibility-item,
.document-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 15px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  line-height: 1.6;
  font-size: 13px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  transition: all 0.2s ease;
}

.responsibility-item:hover,
.document-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  border-color: var(--accent-color);
}

.responsibility-item .checkbox,
.document-item .checkbox {
  color: var(--success-color);
  font-size: 16px;
  font-weight: bold;
  margin-left: 5px;
  flex-shrink: 0;
}

.documents-list {
  margin: 15px 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Declaration and Signatures */
.declaration-text {
  text-align: justify;
  line-height: 1.6;
  margin: 15px 0 25px 0;
  font-size: 13px;
}

.signature-boxes {
  display: flex;
  justify-content: space-between;
  gap: 30px;
  margin: 25px 0;
}

.signature-box {
  flex: 1;
  border: 2px solid var(--primary-color);
  padding: 20px;
  text-align: center;
  border-radius: 8px;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  box-shadow: 0 2px 4px rgba(44, 62, 80, 0.1);
}

.party-title {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 15px;
  text-decoration: underline;
}

.signature-field {
  margin: 10px 0;
  text-align: right;
  line-height: 1.8;
}

.field-line {
  display: inline-block;
  border-bottom: 1px solid #000;
  min-width: 200px;
  margin-right: 10px;
}

/* Seal Section */
.seal-section {
  text-align: center;
  margin: 30px 0;
}

.seal-box {
  border: 2px solid var(--primary-color);
  width: 120px;
  height: 120px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--light-bg) 0%, #ffffff 100%);
  box-shadow: 0 2px 4px rgba(44, 62, 80, 0.1);
}

/* Footer and Signatures */
.print-footer {
  margin-top: 30px;
  page-break-inside: avoid;
}

.signature-section {
  display: flex;
  justify-content: space-between;
  margin: 30px 0;
}

.signature {
  text-align: center;
  flex: 1;
  margin: 0 20px;
}

.signature-line {
  height: 40px;
  border-bottom: 1px solid #000;
  margin-bottom: 10px;
}

.signature p {
  margin: 0;
  font-weight: bold;
  font-size: 12px;
}

.print-date {
  text-align: center;
  font-size: 11px;
  color: #666;
  margin-top: 20px;
}

/* Clear floats */
.section-content::after {
  content: "";
  display: table;
  clear: both;
}

/* Print optimizations */
* {
  -webkit-print-color-adjust: exact !important;
  color-adjust: exact !important;
}

@media print {
  .print-container {
    font-size: 12px;
  }

  .form-section {
    page-break-inside: avoid;
  }
}
</style>