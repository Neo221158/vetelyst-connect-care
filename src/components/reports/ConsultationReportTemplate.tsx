import { Document, Page, Text, View, StyleSheet, Image, PDFDownloadLink } from '@react-pdf/renderer';
import { format } from 'date-fns';

interface ReportData {
  reportNumber: string;
  caseData: any;
  specialist: any;
  letterhead: any;
  clinicalSummary: string;
  diagnosis: any;
  treatmentRecommendations: string;
  prognosis: string;
  followUpInstructions: string;
  digitalSignature?: any;
}

interface ConsultationReportProps {
  data: ReportData;
}

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    borderBottom: 2,
    borderBottomColor: '#2563eb',
    paddingBottom: 15,
  },
  logoContainer: {
    width: '25%',
    alignItems: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  letterheadInfo: {
    width: '75%',
    paddingLeft: 20,
  },
  practiceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  specialistName: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  credentials: {
    fontSize: 9,
    color: '#6b7280',
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 9,
    color: '#374151',
    lineHeight: 1.3,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#1f2937',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  reportMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 4,
  },
  metaColumn: {
    width: '48%',
  },
  metaLabel: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#6b7280',
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 10,
    color: '#1f2937',
    marginBottom: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 8,
    borderBottom: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 3,
  },
  subsectionTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 5,
    marginTop: 10,
  },
  content: {
    fontSize: 10,
    color: '#1f2937',
    lineHeight: 1.5,
    textAlign: 'justify',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  bullet: {
    width: 15,
    fontSize: 10,
  },
  bulletText: {
    flex: 1,
    fontSize: 10,
    color: '#1f2937',
  },
  patientInfo: {
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 4,
    marginBottom: 15,
  },
  patientGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  patientItem: {
    width: '50%',
    marginBottom: 6,
  },
  urgencyBadge: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    padding: 4,
    borderRadius: 2,
    fontSize: 8,
    fontWeight: 'bold',
    textAlign: 'center',
    width: 60,
  },
  emergencyBadge: {
    backgroundColor: '#dc2626',
    color: '#ffffff',
  },
  table: {
    width: '100%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 15,
  },
  tableRow: {
    margin: 'auto',
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f9fafb',
    fontWeight: 'bold',
  },
  tableCol: {
    width: '33%',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    borderTop: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
    fontSize: 8,
    color: '#6b7280',
    textAlign: 'center',
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 60,
    color: '#f3f4f6',
    opacity: 0.1,
    zIndex: -1,
  },
  signature: {
    marginTop: 30,
    borderTop: 1,
    borderTopColor: '#d1d5db',
    paddingTop: 15,
  },
  signatureLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 20,
  },
  signatureBox: {
    width: '40%',
    borderBottom: 1,
    borderBottomColor: '#374151',
    height: 40,
    marginBottom: 5,
  },
  disclaimer: {
    backgroundColor: '#fffbeb',
    border: 1,
    borderColor: '#f59e0b',
    padding: 10,
    marginTop: 20,
    borderRadius: 4,
  },
  disclaimerText: {
    fontSize: 8,
    color: '#92400e',
    fontStyle: 'italic',
    textAlign: 'justify',
  },
});

export const ConsultationReportTemplate = ({ data }: ConsultationReportProps) => {
  const getUrgencyBadgeStyle = (urgency: string) => {
    const baseStyle = { ...styles.urgencyBadge };
    switch (urgency) {
      case 'emergency':
        return { ...baseStyle, ...styles.emergencyBadge };
      case 'urgent':
        return { ...baseStyle, backgroundColor: '#fef3c7', color: '#d97706' };
      default:
        return { ...baseStyle, backgroundColor: '#f0fdf4', color: '#16a34a' };
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Watermark */}
        <Text style={styles.watermark}>VETELYST</Text>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            {data.letterhead?.practice_logo_url && (
              <Image style={styles.logo} src={data.letterhead.practice_logo_url} />
            )}
          </View>
          <View style={styles.letterheadInfo}>
            <Text style={styles.practiceName}>
              {data.letterhead?.practice_name || 'Veterinary Specialty Practice'}
            </Text>
            <Text style={styles.specialistName}>
              {data.specialist?.first_name} {data.specialist?.last_name}
            </Text>
            <Text style={styles.credentials}>
              {data.letterhead?.credentials?.join(', ') || 'DVM, DACVS'}
            </Text>
            <View style={styles.contactInfo}>
              <Text>{data.letterhead?.address_line1}</Text>
              {data.letterhead?.address_line2 && <Text>{data.letterhead.address_line2}</Text>}
              <Text>
                {data.letterhead?.city}, {data.letterhead?.state} {data.letterhead?.postal_code}
              </Text>
              <Text>Phone: {data.letterhead?.phone} | Email: {data.letterhead?.email}</Text>
            </View>
          </View>
        </View>

        {/* Report Title */}
        <Text style={styles.reportTitle}>
          Veterinary Consultation Report
        </Text>

        {/* Report Metadata */}
        <View style={styles.reportMeta}>
          <View style={styles.metaColumn}>
            <Text style={styles.metaLabel}>Report Number</Text>
            <Text style={styles.metaValue}>{data.reportNumber}</Text>
            
            <Text style={styles.metaLabel}>Case Reference</Text>
            <Text style={styles.metaValue}>{data.caseData?.id?.slice(-8).toUpperCase()}</Text>
            
            <Text style={styles.metaLabel}>Report Date</Text>
            <Text style={styles.metaValue}>{format(new Date(), 'MMMM d, yyyy')}</Text>
          </View>
          <View style={styles.metaColumn}>
            <Text style={styles.metaLabel}>Submission Date</Text>
            <Text style={styles.metaValue}>
              {format(new Date(data.caseData?.submitted_at), 'MMMM d, yyyy')}
            </Text>
            
            <Text style={styles.metaLabel}>Urgency Level</Text>
            <View style={getUrgencyBadgeStyle(data.caseData?.urgency)}>
              <Text>{data.caseData?.urgency?.toUpperCase()}</Text>
            </View>
            
            <Text style={styles.metaLabel}>Consultation Type</Text>
            <Text style={styles.metaValue}>
              {data.caseData?.specialty_requested?.replace('_', ' ')?.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Patient Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PATIENT INFORMATION</Text>
          <View style={styles.patientInfo}>
            <View style={styles.patientGrid}>
              <View style={styles.patientItem}>
                <Text style={styles.metaLabel}>Patient Name</Text>
                <Text style={styles.metaValue}>{data.caseData?.patient_name}</Text>
              </View>
              <View style={styles.patientItem}>
                <Text style={styles.metaLabel}>Species</Text>
                <Text style={styles.metaValue}>{data.caseData?.species}</Text>
              </View>
              <View style={styles.patientItem}>
                <Text style={styles.metaLabel}>Breed</Text>
                <Text style={styles.metaValue}>{data.caseData?.breed}</Text>
              </View>
              <View style={styles.patientItem}>
                <Text style={styles.metaLabel}>Age</Text>
                <Text style={styles.metaValue}>
                  {data.caseData?.age_years}y {data.caseData?.age_months}m
                </Text>
              </View>
              <View style={styles.patientItem}>
                <Text style={styles.metaLabel}>Weight</Text>
                <Text style={styles.metaValue}>{data.caseData?.weight_kg} kg</Text>
              </View>
              <View style={styles.patientItem}>
                <Text style={styles.metaLabel}>Gender</Text>
                <Text style={styles.metaValue}>{data.caseData?.gender}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Referring Veterinarian */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REFERRING VETERINARIAN</Text>
          <Text style={styles.content}>
            <Text style={{ fontWeight: 'bold' }}>
              Dr. {data.caseData?.referring_vet?.first_name} {data.caseData?.referring_vet?.last_name}
            </Text>
            {'\n'}
            {data.caseData?.referring_vet?.clinic_name}
          </Text>
        </View>

        {/* Presenting Complaint */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PRESENTING COMPLAINT</Text>
          <Text style={styles.content}>{data.caseData?.chief_complaint}</Text>
          
          <Text style={styles.subsectionTitle}>Detailed History</Text>
          <Text style={styles.content}>{data.caseData?.presenting_complaint}</Text>
        </View>

        {/* Clinical Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CLINICAL REVIEW</Text>
          <Text style={styles.content}>{data.clinicalSummary}</Text>
          
          {data.caseData?.physical_examination && (
            <>
              <Text style={styles.subsectionTitle}>Physical Examination</Text>
              <Text style={styles.content}>{data.caseData.physical_examination}</Text>
            </>
          )}

          {data.caseData?.diagnostic_results && (
            <>
              <Text style={styles.subsectionTitle}>Diagnostic Results</Text>
              <Text style={styles.content}>{data.caseData.diagnostic_results}</Text>
              <Text style={styles.content}>
                <Text style={{ fontStyle: 'italic' }}>Note: Supporting documents are attached to this consultation.</Text>
              </Text>
            </>
          )}
        </View>

        {/* Professional Opinion */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PROFESSIONAL OPINION</Text>
          
          <Text style={styles.subsectionTitle}>Primary Diagnosis</Text>
          <Text style={styles.content}>{data.diagnosis?.primary || data.caseData?.working_diagnosis}</Text>
          
          {data.caseData?.differential_diagnoses && (
            <>
              <Text style={styles.subsectionTitle}>Differential Diagnoses</Text>
              <Text style={styles.content}>{data.caseData.differential_diagnoses}</Text>
            </>
          )}

          <Text style={styles.subsectionTitle}>Treatment Recommendations</Text>
          <Text style={styles.content}>{data.treatmentRecommendations}</Text>

          <Text style={styles.subsectionTitle}>Prognosis</Text>
          <Text style={styles.content}>{data.prognosis}</Text>

          {data.followUpInstructions && (
            <>
              <Text style={styles.subsectionTitle}>Follow-up Instructions</Text>
              <Text style={styles.content}>{data.followUpInstructions}</Text>
            </>
          )}
        </View>

        {/* Digital Signature */}
        <View style={styles.signature}>
          <Text style={styles.subsectionTitle}>Professional Certification</Text>
          <Text style={styles.content}>
            This consultation report has been reviewed and approved by:
          </Text>
          <View style={styles.signatureLine}>
            <View>
              <View style={styles.signatureBox} />
              <Text style={{ fontSize: 9, fontWeight: 'bold' }}>
                Dr. {data.specialist?.first_name} {data.specialist?.last_name}
              </Text>
              <Text style={{ fontSize: 8 }}>
                {data.letterhead?.credentials?.join(', ')}
              </Text>
              <Text style={{ fontSize: 8 }}>
                License: {data.letterhead?.license_numbers?.[0]}
              </Text>
            </View>
            <View style={{ textAlign: 'right' }}>
              <Text style={{ fontSize: 9, fontWeight: 'bold' }}>Date:</Text>
              <Text style={{ fontSize: 9 }}>{format(new Date(), 'MM/dd/yyyy')}</Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            DISCLAIMER: This consultation is based on the information provided and does not constitute a complete physical examination. 
            The referring veterinarian maintains primary responsibility for the patient's care. This consultation is intended to 
            supplement, not replace, professional veterinary judgment. Any treatment decisions should be made in consideration of 
            the complete clinical picture and in consultation with the pet owner.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text>
            Generated by Vetelyst™ Veterinary Consultation Platform | Report #{data.reportNumber} | 
            Page 1 of 1 | Confidential Medical Document
          </Text>
        </View>
      </Page>
    </Document>
  );
};