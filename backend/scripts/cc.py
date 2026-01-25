import matplotlib.pyplot as plt
import numpy as np
from scipy.stats import linregress

# --- 1. DATA ENTRY ---
# Concentration in micrograms/mL
concentrations = np.array([12.5, 25.0, 50.0, 100.0, 150.0])

# Intensity in mAU (Peak Height from your PDF reports / 1000)
# Data sources: IAA 12.5 to IAA 150 files
intensity = np.array([49.631, 103.013, 194.914, 350.618, 516.745])

# --- 2. UNKNOWN DATA ---
# Using the value from your PHOTO (image_e89eb1.jpg) 
# because UNK.pdf was a failed run.
unk_int_val = 175.35  

# --- 3. CALCULATE LINEAR REGRESSION ---
slope, intercept, r_value, p_value, std_err = linregress(concentrations, intensity)
line_eq = f"y = {slope:.4f}x + {intercept:.4f}"
r_sq = f"R² = {r_value**2:.4f}"

# Calculate the Unknown Concentration using the equation: x = (y - c) / m
unk_conc_val = (unk_int_val - intercept) / slope

# --- 4. PLOTTING THE GRAPH ---
plt.figure(figsize=(12, 8))

# Scatter plot for standard points
plt.scatter(concentrations, intensity, color='black', s=50, label='Standard Samples')

# Plot the Unknown Point (Red Star)
plt.scatter(unk_conc_val, unk_int_val, color='red', marker='*', s=150, label='Unknown Sample')

# Trendline
plt.plot(concentrations, slope*concentrations + intercept, color='gray', linestyle='--', alpha=0.7)

# --- 5. CREATE THE OBSERVATIONS TABLE ---
table_text = "OBSERVATIONS\n\n"
table_text += "Conc. (ppm)      Int. (mAU)\n"
table_text += "-" * 28 + "\n"

# Add standard rows
for c, i in zip(concentrations, intensity):
    table_text += f"{c:<16} {i:.3f}\n"

table_text += "-" * 28 + "\n"
# Add the Unknown values calculated above
table_text += f"UNK Int.:        {unk_int_val}\n"
table_text += f"UNK Conc.:       {unk_conc_val:.4f}"

# Place the table
plt.text(10, max(intensity), table_text, 
         fontsize=10, 
         fontfamily='monospace', 
         verticalalignment='top', 
         bbox=dict(boxstyle='round,pad=0.8', facecolor='white', alpha=0.95, edgecolor='gray'))

# --- 6. DISPLAY EQUATION AND LABELS ---
mid_x = 80
mid_y = slope * mid_x + intercept
plt.text(mid_x, mid_y - 60, 
         f"{line_eq}\n{r_sq}", 
         fontsize=12, fontweight='bold', color='blue')

# Axis Labels and Title
plt.title('Standard Calibration Curve (Height in mAU)', fontsize=14, fontweight='bold', pad=15)
plt.xlabel('Concentration ($\mu$g/mL)', fontsize=12)
plt.ylabel('Intensity (mAU)', fontsize=12)

# Grid and Legend
plt.grid(True, linestyle='--', alpha=0.5)
plt.legend(loc='lower right')

# Set limits
plt.xlim(0, 160)
plt.ylim(0, 550)

plt.tight_layout()
plt.show()

# Print the final result for you to copy if needed
print(f"Unknown Concentration: {unk_conc_val:.4f} ug/mL")