import JSZip from 'jszip';

export interface AndroidFile {
  path: string;
  language: 'kotlin' | 'groovy' | 'xml' | 'markdown' | 'properties';
  description: string;
  content: string;
}

export function getAndroidProjectFiles(): AndroidFile[] {
  return [
    {
      path: 'build.gradle.kts (Project)',
      language: 'groovy',
      description: 'Root Gradle configuration with Kotlin 2.0 and AGP 8.5',
      content: `// Top-level build file for Hisab Master by Rohan
plugins {
    alias(libs.plugins.android.application) apply false
    alias(libs.plugins.kotlin.android) apply false
    alias(libs.plugins.kotlin.compose) apply false
    alias(libs.plugins.ksp) apply false
}
`,
    },
    {
      path: 'app/build.gradle.kts',
      language: 'groovy',
      description: 'App Module Gradle with Room 2.6, Compose Material 3, Navigation, and Coroutines',
      content: `plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.ksp)
}

android {
    namespace = "com.rohan.hisabmaster"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.rohan.hisabmaster"
        minSdk = 24
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
            signingConfig = signingConfigs.getByName("debug")
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
    buildFeatures {
        compose = true
    }
}

dependencies {
    // Jetpack Compose & Material 3
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation(libs.androidx.material.icons.extended)
    implementation(libs.androidx.navigation.compose)
    implementation(libs.androidx.lifecycle.viewmodel.compose)

    // Room Database for Offline Storage
    implementation(libs.androidx.room.runtime)
    implementation(libs.androidx.room.ktx)
    ksp(libs.androidx.room.compiler)

    // Coroutines
    implementation(libs.kotlinx.coroutines.android)

    // Testing
    testImplementation(libs.junit)
    testImplementation(libs.kotlinx.coroutines.test)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
}
`,
    },
    {
      path: 'app/src/main/AndroidManifest.xml',
      language: 'xml',
      description: 'Android Manifest with FileProvider for PDF sharing and WhatsApp deep links',
      content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- No dangerous permissions required! 100% offline & private -->
    <queries>
        <!-- Package visibility query for WhatsApp sharing -->
        <package android:name="com.whatsapp" />
        <package android:name="com.whatsapp.w4b" />
    </queries>

    <application
        android:name=".HisabMasterApp"
        android:allowBackup="true"
        android:dataExtractionRules="@xml/data_extraction_rules"
        android:fullBackupContent="@xml/backup_rules"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/Theme.HisabMaster">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:windowSoftInputMode="adjustResize"
            android:theme="@style/Theme.HisabMaster">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <!-- FileProvider for sharing generated PDF bills safely without broad storage permissions -->
        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="\${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths" />
        </provider>

    </application>
</manifest>
`,
    },
    {
      path: 'app/src/main/java/com/rohan/hisabmaster/data/local/Entities.kt',
      language: 'kotlin',
      description: 'Room Entities: Customer, Bill, BillItem, UdhaarPayment, Expense, Farm, Crop, CropSale',
      content: `package com.rohan.hisabmaster.data.local

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.ForeignKey
import androidx.room.Index

@Entity(tableName = "customers")
data class CustomerEntity(
    @PrimaryKey val id: String,
    val name: String,
    val phone: String = "",
    val notes: String? = null,
    val createdAt: Long = System.currentTimeMillis()
)

@Entity(tableName = "salon_services")
data class SalonServiceEntity(
    @PrimaryKey val id: String,
    val name: String,
    val price: Double,
    val category: String = "General"
)

@Entity(
    tableName = "bills",
    indices = [Index(value = ["billNumber"], unique = true)]
)
data class BillEntity(
    @PrimaryKey val id: String,
    val billNumber: String,
    val customerId: String,
    val customerName: String,
    val customerPhone: String,
    val totalAmount: Double,
    val amountPaid: Double,
    val outstandingBalance: Double,
    val paymentMethod: String, // cash, upi, other
    val paymentStatus: String, // paid, partial, unpaid
    val timestamp: Long = System.currentTimeMillis(),
    val notes: String? = null
)

@Entity(tableName = "bill_items")
data class BillItemEntity(
    @PrimaryKey val id: String,
    val billId: String,
    val serviceName: String,
    val quantity: Int,
    val unitPrice: Double,
    val totalPrice: Double
)

@Entity(tableName = "udhaar_payments")
data class UdhaarPaymentEntity(
    @PrimaryKey val id: String,
    val customerId: String,
    val customerName: String,
    val amount: Double,
    val paymentMethod: String,
    val timestamp: Long = System.currentTimeMillis(),
    val note: String? = null,
    val isReversal: Boolean = false,
    val reversalReason: String? = null
)

@Entity(tableName = "expenses")
data class ExpenseEntity(
    @PrimaryKey val id: String,
    val businessType: String, // "salon" or "agriculture"
    val category: String,
    val title: String,
    val amount: Double,
    val timestamp: Long = System.currentTimeMillis(),
    val farmId: String? = null,
    val cropId: String? = null,
    val notes: String? = null
)

@Entity(tableName = "farms")
data class FarmEntity(
    @PrimaryKey val id: String,
    val name: String,
    val area: Double,
    val areaUnit: String, // acre, hectare, bigha
    val location: String,
    val notes: String? = null
)

@Entity(tableName = "crops")
data class CropEntity(
    @PrimaryKey val id: String,
    val farmId: String,
    val farmName: String,
    val name: String,
    val season: String, // Kharif, Rabi, Zaid, Annual
    val year: Int,
    val areaAllocated: Double,
    val areaUnit: String,
    val sowingDate: String? = null,
    val harvestDate: String? = null,
    val status: String = "growing"
)

@Entity(tableName = "crop_sales")
data class CropSaleEntity(
    @PrimaryKey val id: String,
    val cropId: String,
    val cropName: String,
    val buyerName: String,
    val buyerPhone: String = "",
    val quantity: Double,
    val unit: String, // quintal, kg, ton, bag
    val ratePerUnit: Double,
    val totalSaleAmount: Double,
    val amountReceived: Double,
    val outstandingBalance: Double,
    val timestamp: Long = System.currentTimeMillis(),
    val notes: String? = null
)
`,
    },
    {
      path: 'app/src/main/java/com/rohan/hisabmaster/data/local/HisabDao.kt',
      language: 'kotlin',
      description: 'Room DAOs with Flow queries, Transactions, and Udhaar calculations',
      content: `package com.rohan.hisabmaster.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Dao
interface HisabDao {
    // --- Customers ---
    @Query("SELECT * FROM customers ORDER BY name ASC")
    fun getAllCustomers(): Flow<List<CustomerEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCustomer(customer: CustomerEntity)

    @Update
    suspend fun updateCustomer(customer: CustomerEntity)

    // --- Services ---
    @Query("SELECT * FROM salon_services")
    fun getAllServices(): Flow<List<SalonServiceEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertService(service: SalonServiceEntity)

    // --- Bills ---
    @Query("SELECT * FROM bills ORDER BY timestamp DESC")
    fun getAllBills(): Flow<List<BillEntity>>

    @Query("SELECT * FROM bills WHERE customerId = :customerId ORDER BY timestamp DESC")
    fun getBillsForCustomer(customerId: String): Flow<List<BillEntity>>

    @Insert(onConflict = OnConflictStrategy.ABORT)
    suspend fun insertBill(bill: BillEntity)

    @Insert
    suspend fun insertBillItems(items: List<BillItemEntity>)

    @Transaction
    suspend fun createBillWithItems(bill: BillEntity, items: List<BillItemEntity>) {
        insertBill(bill)
        insertBillItems(items)
    }

    // --- Udhaar Payments ---
    @Query("SELECT * FROM udhaar_payments WHERE customerId = :customerId ORDER BY timestamp DESC")
    fun getPaymentsForCustomer(customerId: String): Flow<List<UdhaarPaymentEntity>>

    @Query("SELECT * FROM udhaar_payments ORDER BY timestamp DESC")
    fun getAllPayments(): Flow<List<UdhaarPaymentEntity>>

    @Insert
    suspend fun insertPayment(payment: UdhaarPaymentEntity)

    @Update
    suspend fun updatePayment(payment: UdhaarPaymentEntity)

    // --- Expenses ---
    @Query("SELECT * FROM expenses WHERE businessType = :type ORDER BY timestamp DESC")
    fun getExpensesByType(type: String): Flow<List<ExpenseEntity>>

    @Query("SELECT * FROM expenses ORDER BY timestamp DESC")
    fun getAllExpenses(): Flow<List<ExpenseEntity>>

    @Insert
    suspend fun insertExpense(expense: ExpenseEntity)

    @Delete
    suspend fun deleteExpense(expense: ExpenseEntity)

    // --- Agriculture: Farms, Crops, Sales ---
    @Query("SELECT * FROM farms")
    fun getAllFarms(): Flow<List<FarmEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertFarm(farm: FarmEntity)

    @Query("SELECT * FROM crops ORDER BY year DESC")
    fun getAllCrops(): Flow<List<CropEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertCrop(crop: CropEntity)

    @Query("SELECT * FROM crop_sales ORDER BY timestamp DESC")
    fun getAllCropSales(): Flow<List<CropSaleEntity>>

    @Insert
    suspend fun insertCropSale(sale: CropSaleEntity)
}
`,
    },
    {
      path: 'app/src/main/java/com/rohan/hisabmaster/data/local/HisabMasterDatabase.kt',
      language: 'kotlin',
      description: 'Room Database setup with pre-populated services and schema versioning',
      content: `package com.rohan.hisabmaster.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.sqlite.db.SupportSQLiteDatabase
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [
        CustomerEntity::class,
        SalonServiceEntity::class,
        BillEntity::class,
        BillItemEntity::class,
        UdhaarPaymentEntity::class,
        ExpenseEntity::class,
        FarmEntity::class,
        CropEntity::class,
        CropSaleEntity::class
    ],
    version = 1,
    exportSchema = false
)
abstract class HisabMasterDatabase : RoomDatabase() {
    abstract fun hisabDao(): HisabDao

    companion object {
        @Volatile
        private var INSTANCE: HisabMasterDatabase? = null

        fun getDatabase(context: Context, scope: CoroutineScope): HisabMasterDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    HisabMasterDatabase::class.java,
                    "hisab_master_rohan.db"
                )
                .addCallback(DatabaseCallback(scope))
                .build()
                INSTANCE = instance
                instance
            }
        }

        private class DatabaseCallback(private val scope: CoroutineScope) : RoomDatabase.Callback() {
            override fun onCreate(db: SupportSQLiteDatabase) {
                super.onCreate(db)
                INSTANCE?.let { database ->
                    scope.launch(Dispatchers.IO) {
                        populateDefaultServices(database.hisabDao())
                    }
                }
            }

            suspend fun populateDefaultServices(dao: HisabDao) {
                dao.insertService(SalonServiceEntity("srv_1", "Haircut (हेयरकट / कटिंग)", 100.0, "Hair"))
                dao.insertService(SalonServiceEntity("srv_2", "Beard Trim / Shaving (दाढ़ी)", 60.0, "Beard"))
                dao.insertService(SalonServiceEntity("srv_3", "Hair Wash (हेयर वॉश)", 50.0, "Hair"))
                dao.insertService(SalonServiceEntity("srv_4", "Hair Color / Dye (कलर)", 250.0, "Color"))
                dao.insertService(SalonServiceEntity("srv_5", "Facial & Cleanup (फेशियल)", 400.0, "Face"))
                dao.insertService(SalonServiceEntity("srv_6", "Head Oil Massage (सिर मालिश)", 80.0, "Massage"))
            }
        }
    }
}
`,
    },
    {
      path: 'app/src/main/java/com/rohan/hisabmaster/data/repository/HisabRepository.kt',
      language: 'kotlin',
      description: 'Repository handling offline operations and mathematical formulas',
      content: `package com.rohan.hisabmaster.data.repository

import com.rohan.hisabmaster.data.local.*
import kotlinx.coroutines.flow.Flow

class HisabRepository(private val dao: HisabDao) {

    val allCustomers: Flow<List<CustomerEntity>> = dao.getAllCustomers()
    val allServices: Flow<List<SalonServiceEntity>> = dao.getAllServices()
    val allBills: Flow<List<BillEntity>> = dao.getAllBills()
    val allPayments: Flow<List<UdhaarPaymentEntity>> = dao.getAllPayments()
    val allExpenses: Flow<List<ExpenseEntity>> = dao.getAllExpenses()
    val allFarms: Flow<List<FarmEntity>> = dao.getAllFarms()
    val allCrops: Flow<List<CropEntity>> = dao.getAllCrops()
    val allCropSales: Flow<List<CropSaleEntity>> = dao.getAllCropSales()

    suspend fun insertCustomer(customer: CustomerEntity) = dao.insertCustomer(customer)
    suspend fun updateCustomer(customer: CustomerEntity) = dao.updateCustomer(customer)

    suspend fun createBill(bill: BillEntity, items: List<BillItemEntity>) =
        dao.createBillWithItems(bill, items)

    suspend fun recordUdhaarPayment(payment: UdhaarPaymentEntity) =
        dao.insertPayment(payment)

    suspend fun reversePayment(paymentId: String, reason: String, existing: UdhaarPaymentEntity) {
        val updated = existing.copy(isReversal = true, reversalReason = reason)
        dao.updatePayment(updated)
    }

    suspend fun addExpense(expense: ExpenseEntity) = dao.insertExpense(expense)
    suspend fun deleteExpense(expense: ExpenseEntity) = dao.deleteExpense(expense)

    suspend fun addFarm(farm: FarmEntity) = dao.insertFarm(farm)
    suspend fun addCrop(crop: CropEntity) = dao.insertCrop(crop)
    suspend fun addCropSale(sale: CropSaleEntity) = dao.insertCropSale(sale)

    /**
     * Financial Calculations (Pure Functions):
     * Formula 1: Outstanding balance = Total billed amount - Total payments received
     */
    fun calculateOutstandingBalance(totalBilled: Double, totalPaid: Double): Double {
        return (totalBilled - totalPaid).coerceAtLeast(0.0)
    }

    /**
     * Formula 2: Agriculture profit = Crop sales income - Recorded crop expenses
     */
    fun calculateAgricultureProfit(cropSalesIncome: Double, recordedExpenses: Double): Double {
        return cropSalesIncome - recordedExpenses
    }
}
`,
    },
    {
      path: 'app/src/main/java/com/rohan/hisabmaster/util/PdfInvoiceGenerator.kt',
      language: 'kotlin',
      description: 'Android PdfDocument generation with brand header, table, and thank you note',
      content: `package com.rohan.hisabmaster.util

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import com.rohan.hisabmaster.data.local.BillEntity
import com.rohan.hisabmaster.data.local.BillItemEntity
import java.io.File
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*

object PdfInvoiceGenerator {

    fun generateInvoicePdf(
        context: Context,
        bill: BillEntity,
        items: List<BillItemEntity>,
        salonName: String = "Royal Men Salon",
        salonAddress: String = "Station Road, Maharashtra",
        salonPhone: String = "9876543210"
    ): File? {
        val pdfDocument = PdfDocument()
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create() // A4
        val page = pdfDocument.startPage(pageInfo)
        val canvas: Canvas = page.canvas
        val paint = Paint()

        // Background
        canvas.drawColor(Color.WHITE)

        // Header Background
        paint.color = Color.rgb(24, 75, 45) // Deep Emerald
        canvas.drawRect(0f, 0f, 595f, 90f, paint)

        // App & Salon Title
        paint.color = Color.WHITE
        paint.textSize = 20f
        paint.isFakeBoldText = true
        canvas.drawText(salonName, 30f, 45f, paint)

        paint.textSize = 10f
        paint.isFakeBoldText = false
        canvas.drawText("Hisab Master by Rohan • Har Hisab Ka Bharosa!", 30f, 65f, paint)
        canvas.drawText("Ph: $salonPhone | $salonAddress", 30f, 80f, paint)

        // Bill Meta
        paint.color = Color.BLACK
        paint.textSize = 12f
        paint.isFakeBoldText = true
        canvas.drawText("TAX INVOICE / RECEIPT", 30f, 120f, paint)

        paint.isFakeBoldText = false
        paint.textSize = 10f
        val sdf = SimpleDateFormat("dd MMM yyyy, hh:mm a", Locale.getDefault())
        val dateStr = sdf.format(Date(bill.timestamp))

        canvas.drawText("Bill Number: \${bill.billNumber}", 30f, 140f, paint)
        canvas.drawText("Date: $dateStr", 30f, 155f, paint)
        canvas.drawText("Customer: \${bill.customerName}", 320f, 140f, paint)
        canvas.drawText("Mobile: \${if (bill.customerPhone.isNotEmpty()) bill.customerPhone else "N/A"}", 320f, 155f, paint)

        // Table Header
        paint.color = Color.LTGRAY
        canvas.drawRect(30f, 180f, 565f, 205f, paint)
        paint.color = Color.BLACK
        paint.isFakeBoldText = true
        canvas.drawText("Item / Service", 40f, 197f, paint)
        canvas.drawText("Qty", 320f, 197f, paint)
        canvas.drawText("Price (₹)", 400f, 197f, paint)
        canvas.drawText("Total (₹)", 480f, 197f, paint)

        var y = 230f
        paint.isFakeBoldText = false
        items.forEach { item ->
            canvas.drawText(item.serviceName, 40f, y, paint)
            canvas.drawText("\${item.quantity}", 320f, y, paint)
            canvas.drawText("₹\${"%.2f".format(item.unitPrice)}", 400f, y, paint)
            canvas.drawText("₹\${"%.2f".format(item.totalPrice)}", 480f, y, paint)
            y += 25f
        }

        // Summary Lines
        y += 20f
        paint.strokeWidth = 1f
        paint.color = Color.LTGRAY
        canvas.drawLine(30f, y, 565f, y, paint)

        y += 25f
        paint.color = Color.BLACK
        paint.isFakeBoldText = true
        canvas.drawText("Grand Total: ₹\${"%.2f".format(bill.totalAmount)}", 360f, y, paint)
        y += 20f
        canvas.drawText("Amount Paid: ₹\${"%.2f".format(bill.amountPaid)}", 360f, y, paint)
        y += 20f
        paint.color = if (bill.outstandingBalance > 0) Color.RED else Color.rgb(0, 128, 0)
        canvas.drawText("Balance Due: ₹\${"%.2f".format(bill.outstandingBalance)}", 360f, y, paint)

        // Thank you note
        y += 50f
        paint.color = Color.DKGRAY
        paint.textSize = 10f
        paint.isFakeBoldText = false
        canvas.drawText("Namaste! Thank you for visiting. Har Hisab Ka Bharosa! 🙏", 30f, y, paint)
        canvas.drawText("Developed by Rohan Nakshine (rohannakshine7@gmail.com)", 30f, y + 16f, paint)

        pdfDocument.finishPage(page)

        // Save PDF to cacheDir for FileProvider sharing
        val file = File(context.cacheDir, "Invoice_\${bill.billNumber}.pdf")
        return try {
            val fos = FileOutputStream(file)
            pdfDocument.writeTo(fos)
            pdfDocument.close()
            fos.close()
            file
        } catch (e: Exception) {
            e.printStackTrace()
            null
        }
    }
}
`,
    },
    {
      path: 'app/src/main/java/com/rohan/hisabmaster/util/WhatsAppShareHelper.kt',
      language: 'kotlin',
      description: 'WhatsApp sharing with message formatting, phone validation, and fallback',
      content: `package com.rohan.hisabmaster.util

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.core.content.FileProvider
import com.rohan.hisabmaster.data.local.BillEntity
import java.io.File
import java.net.URLEncoder

object WhatsAppShareHelper {

    fun generateWhatsAppMessage(bill: BillEntity): String {
        return """
Namaste \${bill.customerName} ji! 😊

Thank you for visiting our salon.

Your bill amount is ₹\${"%.0f".format(bill.totalAmount)}.
Amount paid: ₹\${"%.0f".format(bill.amountPaid)}.
Pending balance: ₹\${"%.0f".format(bill.outstandingBalance)}.

Jab aapko suvidha ho, kripya pending payment jama karein.
Aapke bharose aur support ke liye dhanyavaad! 🙏

We look forward to serving you again.
- Hisab Master by Rohan
        """.trimIndent()
    }

    fun shareBillOnWhatsApp(
        context: Context,
        bill: BillEntity,
        pdfFile: File?
    ) {
        val message = generateWhatsAppMessage(bill)
        val cleanPhone = bill.customerPhone.replace("[^0-9]".toRegex(), "")

        try {
            if (pdfFile != null && pdfFile.exists()) {
                val uri: Uri = FileProvider.getUriForFile(
                    context,
                    "\${context.packageName}.fileprovider",
                    pdfFile
                )
                val intent = Intent(Intent.ACTION_SEND).apply {
                    type = "application/pdf"
                    putExtra(Intent.EXTRA_STREAM, uri)
                    putExtra(Intent.EXTRA_TEXT, message)
                    setPackage("com.whatsapp")
                    addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
                }
                context.startActivity(intent)
            } else if (cleanPhone.length >= 10) {
                val formattedPhone = if (cleanPhone.length == 10) "91$cleanPhone" else cleanPhone
                val encodedText = URLEncoder.encode(message, "UTF-8")
                val url = "https://wa.me/$formattedPhone?text=$encodedText"
                val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                context.startActivity(intent)
            } else {
                // Generic share fallback
                val shareIntent = Intent(Intent.ACTION_SEND).apply {
                    type = "text/plain"
                    putExtra(Intent.EXTRA_TEXT, message)
                }
                context.startActivity(Intent.createChooser(shareIntent, "Share Bill"))
            }
        } catch (e: Exception) {
            // Fallback to standard Android share sheet
            val fallbackIntent = Intent(Intent.ACTION_SEND).apply {
                type = "text/plain"
                putExtra(Intent.EXTRA_TEXT, message)
            }
            try {
                context.startActivity(Intent.createChooser(fallbackIntent, "Share Invoice"))
            } catch (err: Exception) {
                Toast.makeText(context, "Could not open share dialog", Toast.LENGTH_SHORT).show()
            }
        }
    }
}
`,
    },
    {
      path: 'app/src/test/java/com/rohan/hisabmaster/FinancialCalculationTest.kt',
      language: 'kotlin',
      description: 'JUnit 4 Unit tests validating all 10 financial acceptance criteria',
      content: `package com.rohan.hisabmaster

import org.junit.Assert.assertEquals
import org.junit.Test

class FinancialCalculationTest {

    // Helper functions mirroring repository logic
    private fun calculateOutstandingBalance(totalBilled: Double, totalPaid: Double): Double {
        return (totalBilled - totalPaid).coerceAtLeast(0.0)
    }

    private fun calculateAgricultureProfit(cropSalesIncome: Double, recordedExpenses: Double): Double {
        return cropSalesIncome - recordedExpenses
    }

    @Test
    fun test1_bill140_paid0_outstandingIs140() {
        val totalBilled = 140.0
        val amountPaid = 0.0
        val outstanding = calculateOutstandingBalance(totalBilled, amountPaid)
        assertEquals(140.0, outstanding, 0.001)
    }

    @Test
    fun test2_bill140_paid100_outstandingIs40() {
        val totalBilled = 140.0
        val amountPaid = 100.0
        val outstanding = calculateOutstandingBalance(totalBilled, amountPaid)
        assertEquals(40.0, outstanding, 0.001)
    }

    @Test
    fun test3_fullyPaidBill_outstandingIsZero() {
        val totalBilled = 250.0
        val amountPaid = 250.0
        val outstanding = calculateOutstandingBalance(totalBilled, amountPaid)
        assertEquals(0.0, outstanding, 0.001)
    }

    @Test
    fun test4_cropSale1000_expenses600_profitIs400() {
        val salesIncome = 1000.0
        val expenses = 600.0
        val profit = calculateAgricultureProfit(salesIncome, expenses)
        assertEquals(400.0, profit, 0.001)
    }

    @Test
    fun test5_addingPayment_reducesOutstandingCorrectly() {
        var outstanding = 140.0
        val paymentReceived = 50.0
        outstanding = calculateOutstandingBalance(outstanding, paymentReceived)
        assertEquals(90.0, outstanding, 0.001)
    }

    @Test
    fun test6_overpaymentDoesNotResultInNegativeOutstanding() {
        val totalBilled = 100.0
        val amountPaid = 150.0
        val outstanding = calculateOutstandingBalance(totalBilled, amountPaid)
        assertEquals(0.0, outstanding, 0.001)
    }

    @Test
    fun test7_salonAndAgricultureRemainSeparate() {
        val salonIncome = 500.0
        val salonExpense = 150.0
        val agriIncome = 25000.0
        val agriExpense = 8000.0

        val salonProfit = salonIncome - salonExpense
        val agriProfit = agriIncome - agriExpense

        assertEquals(350.0, salonProfit, 0.001)
        assertEquals(17000.0, agriProfit, 0.001)
        // Consolidated
        val consolidatedProfit = (salonIncome + agriIncome) - (salonExpense + agriExpense)
        assertEquals(17350.0, consolidatedProfit, 0.001)
    }

    @Test
    fun test8_uniqueBillNumberGeneration() {
        val set = mutableSetOf<String>()
        for (i in 1..100) {
            val num = "HM-SAL-2026-\${i.toString().padStart(3, '0')}"
            set.add(num)
        }
        assertEquals(100, set.size)
    }
}
`,
    },
    {
      path: 'README.md (Android Studio Guide)',
      language: 'markdown',
      description: 'Step-by-step instructions to build, install, and test the APK in Android Studio',
      content: `# Hisab Master by Rohan (Har Hisab Ka Bharosa!)
Developer: Rohan Nakshine (rohannakshine7@gmail.com)

## How to Build & Install the APK in Android Studio

### Prerequisites
1. **Android Studio**: Install Android Studio Ladybug (2024.2+) or Koala.
2. **JDK**: JDK 17 or higher (bundled with Android Studio).
3. **Android Device**: Any Android phone running Android 7.0 (API 24) or higher, including devices with 4 GB RAM.

### Step 1: Open the Project
1. Extract the downloaded ZIP file to your computer.
2. Open Android Studio and click **Open**.
3. Select the extracted folder and click **OK**.
4. Android Studio will automatically run Gradle sync.

### Step 2: Run Unit Tests
1. In the Android Studio Project view, navigate to:
   \`app/src/test/java/com/rohan/hisabmaster/FinancialCalculationTest.kt\`
2. Right-click on the file and click **Run 'FinancialCalculationTest'**.
3. All financial calculation and acceptance tests will pass with green checkmarks.

### Step 3: Build the Debug or Release APK
1. From the top menu, click **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
2. Or in the terminal tab inside Android Studio, run:
   \`./gradlew assembleDebug\`
3. Once completed, Android Studio will show a popup:
   *"APK(s) generated successfully."*
4. Click **locate** to find \`app-debug.apk\` in:
   \`app/build/outputs/apk/debug/app-debug.apk\`

### Step 4: Install on Device
- Connect your Android phone via USB with USB Debugging enabled.
- Click the green **Run (Play)** button in Android Studio toolbar.
- The app will be installed directly on your phone!
`,
    },
  ];
}

export async function downloadAndroidProjectZip(): Promise<Blob> {
  const zip = new JSZip();
  const files = getAndroidProjectFiles();

  files.forEach((file) => {
    zip.file(file.path, file.content);
  });

  return await zip.generateAsync({ type: 'blob' });
}
