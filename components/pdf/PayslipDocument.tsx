import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: 'Helvetica' },
  header: { alignItems: 'center', marginBottom: 20 },
  companyName: { fontSize: 18, fontWeight: 'bold' },
  title: { fontSize: 14, marginVertical: 5 },
  section: { marginVertical: 10 },
  row: { flexDirection: 'row', borderBottom: '1 solid #eee', paddingVertical: 4 },
  label: { width: '40%', color: '#555' },
  value: { width: '60%', fontWeight: 'bold' },
  table: { width: '100%', flexDirection: 'row', marginTop: 10 },
  column: { width: '50%', padding: 10, border: '1 solid #eee' },
  tableHeader: { fontWeight: 'bold', marginBottom: 5, borderBottom: '1 solid #eee', paddingBottom: 5 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 3 },
  netPay: { marginTop: 20, padding: 10, backgroundColor: '#f0f0f0', alignItems: 'center' },
  netPayText: { fontSize: 14, fontWeight: 'bold' }
})

export const PayslipDocument = ({ payroll }: { payroll: any }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.companyName}>{payroll.employees?.companies?.name || 'ABC Company Pvt. Ltd.'}</Text>
        <Text style={styles.title}>Payslip for {payroll.month}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.row}><Text style={styles.label}>Employee ID</Text><Text style={styles.value}>{payroll.employees?.emp_id}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Name</Text><Text style={styles.value}>{payroll.employees?.full_name}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Designation</Text><Text style={styles.value}>{payroll.employees?.designation}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Department</Text><Text style={styles.value}>{payroll.employees?.department}</Text></View>
        <View style={styles.row}><Text style={styles.label}>Bank Account</Text><Text style={styles.value}>{payroll.employees?.bank_account} ({payroll.employees?.bank_ifsc})</Text></View>
      </View>

      <View style={styles.table}>
        <View style={styles.column}>
          <Text style={styles.tableHeader}>Earnings</Text>
          <View style={styles.tableRow}><Text>Basic Salary</Text><Text>{payroll.basic_salary}</Text></View>
          <View style={styles.tableRow}><Text>HRA</Text><Text>{payroll.hra}</Text></View>
          <View style={styles.tableRow}><Text>DA</Text><Text>{payroll.da}</Text></View>
          <View style={styles.tableRow}><Text>Travel Allowance</Text><Text>{payroll.travel_allowance}</Text></View>
          <View style={styles.tableRow}><Text>Other Allowance</Text><Text>{payroll.other_allowance}</Text></View>
          <View style={[styles.tableRow, { marginTop: 10, fontWeight: 'bold', borderTop: '1 solid #eee', paddingTop: 5 }]}>
            <Text>Gross Earnings</Text><Text>{payroll.gross_salary}</Text>
          </View>
        </View>

        <View style={styles.column}>
          <Text style={styles.tableHeader}>Deductions</Text>
          <View style={styles.tableRow}><Text>PF</Text><Text>{payroll.pf_deduction}</Text></View>
          <View style={styles.tableRow}><Text>ESI</Text><Text>{payroll.esi_deduction}</Text></View>
          <View style={styles.tableRow}><Text>Prof. Tax</Text><Text>{payroll.professional_tax}</Text></View>
          <View style={styles.tableRow}><Text>TDS</Text><Text>{payroll.tds_deduction}</Text></View>
          <View style={[styles.tableRow, { marginTop: 10, fontWeight: 'bold', borderTop: '1 solid #eee', paddingTop: 5 }]}>
            <Text>Total Deductions</Text><Text>{payroll.total_deductions}</Text>
          </View>
        </View>
      </View>

      <View style={styles.netPay}>
        <Text style={styles.netPayText}>Net Payable: Rs. {payroll.net_salary}</Text>
      </View>

      <View style={{ marginTop: 40, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text>Employee Signature</Text>
        <Text>Authorized Signatory</Text>
      </View>
    </Page>
  </Document>
)
