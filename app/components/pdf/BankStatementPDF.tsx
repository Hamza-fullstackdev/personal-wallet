import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Polygon,
  Rect,
  Image,
} from "@react-pdf/renderer";
import type { StatementData } from "@/app/api/user/bank-statement/data/route";

const PURPLE = "#602080";
const PINK = "#e94ca2";
const A4_WIDTH = 595.28;
const A4_HEIGHT = 841.89;

const styles = StyleSheet.create({
  page: {
    paddingTop: 118,
    paddingBottom: 150,
    paddingHorizontal: 38,
    fontSize: 12,
    fontFamily: "Helvetica",
    color: "#0f172a",
    backgroundColor: "#ffffff",
    position: "relative",
  },
  decoration: {
    position: "absolute",
    top: 0,
    left: 0,
    width: A4_WIDTH,
    height: A4_HEIGHT,
  },

  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 16,
    borderBottomWidth: 1.5,
    borderBottomColor: PURPLE,
    marginBottom: 18,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoBox: {
    width: 34,
    height: 34,
    backgroundColor: PURPLE,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: PINK,
  },
  logoText: {
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
  },
  brandTitle: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: PURPLE,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 7.5,
    color: "#64748b",
    marginTop: 3,
    letterSpacing: 0.2,
  },
  headerMetaBox: {
    alignItems: "flex-end",
  },
  statementDocBadge: {
    backgroundColor: "#faf5ff",
    borderRadius: 3,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#e9d5ff",
    marginBottom: 4,
  },
  statementDocText: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: PURPLE,
    letterSpacing: 0.3,
  },
  headerMetaLine: {
    fontSize: 7.2,
    color: "#64748b",
    marginTop: 2,
  },
  headerMetaLineBold: {
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
  },

  accountBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 16,
  },
  accountCol: {
    flex: 1,
  },
  accountLabel: {
    fontSize: 6.5,
    color: "#64748b",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 3,
  },
  accountValue: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  accountSubtext: {
    fontSize: 7,
    color: "#64748b",
    marginTop: 2,
  },

  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 18,
  },
  summaryCard: {
    flexGrow: 1,
    flexBasis: "30%",
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  summaryCardDark: {
    flexGrow: 1,
    flexBasis: "30%",
    backgroundColor: PURPLE,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  summaryCardLabel: {
    fontSize: 6.2,
    color: "#64748b",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  summaryCardLabelDark: {
    fontSize: 6.2,
    color: "#e9d5ff",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    marginBottom: 3,
  },
  summaryCardValue: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  summaryCardValueDark: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
  },
  summaryCardValueGreen: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#047857",
  },
  summaryCardValueRed: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#b91c1c",
  },

  sectionHeading: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: PURPLE,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 8,
    marginTop: 4,
  },

  table: {
    width: "100%",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 3,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: PURPLE,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: "center",
  },
  tableHeaderCell: {
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 7,
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
    alignItems: "center",
    backgroundColor: "#faf5ff",
  },
  tableRowHighlight: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    alignItems: "center",
    backgroundColor: "#f3e8ff",
  },
  tableRowClosing: {
    flexDirection: "row",
    paddingVertical: 9,
    paddingHorizontal: 6,
    alignItems: "center",
    backgroundColor: "#faf5ff",
    borderTopWidth: 1.5,
    borderTopColor: PURPLE,
  },

  colDate: { width: "12%" },
  colDesc: { width: "30%" },
  colCategory: { width: "15%" },
  colType: { width: "13%" },
  colDebit: { width: "10%", textAlign: "right" },
  colCredit: { width: "10%", textAlign: "right" },
  colBalance: { width: "10%", textAlign: "right" },

  cellText: {
    fontSize: 7.2,
    color: "#334155",
  },
  cellTextBold: {
    fontSize: 7.2,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  debitText: {
    fontSize: 7.2,
    fontFamily: "Helvetica-Bold",
    color: "#b91c1c",
  },
  creditText: {
    fontSize: 7.2,
    fontFamily: "Helvetica-Bold",
    color: "#047857",
  },

  badgeBase: {
    fontSize: 6.2,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 2,
    alignSelf: "flex-start",
  },
  badgeGreen: {
    backgroundColor: "#d1fae5",
    color: "#065f46",
  },
  badgePink: {
    backgroundColor: "#fce7f3",
    color: "#9d174d",
  },
  badgePurple: {
    backgroundColor: "#f3e8ff",
    color: PURPLE,
  },
  badgeAmber: {
    backgroundColor: "#fef3c7",
    color: "#92400e",
  },
  badgeBlue: {
    backgroundColor: "#dbeafe",
    color: "#1e40af",
  },
  categoryBox: {
    backgroundColor: "#ffffff",
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 18,
  },
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  categoryCol: {
    flexGrow: 1,
    flexBasis: "20%",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRightWidth: 1,
    borderRightColor: "#e2e8f0",
  },
  categoryColLast: {
    flexGrow: 1,
    flexBasis: "20%",
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  categoryLabel: {
    fontSize: 6.5,
    color: "#64748b",
    textTransform: "uppercase",
    fontFamily: "Helvetica-Bold",
    marginBottom: 3,
  },
  categoryVal: {
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
    color: PURPLE,
  },
  footer: {
    position: "absolute",
    bottom: 45,
    left: 38,
    right: 38,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 6.5,
    color: "#64748b",
  },
  emptyState: {
    padding: 16,
    textAlign: "center",
    color: "#64748b",
    fontSize: 8,
  },
});

const PageDecoration = () => (
  <Svg
    viewBox="0 0 793.7 1122.5"
    style={styles.decoration}
    fixed
  >
    <Polygon points="0,0 130,0 0,157" fill="#602080" />
    <Polygon points="130,0 336,0 38,113" fill="#e94ca2" />
    {/* Pink triangles */}
    <Polygon points="778.7,142 793.7,158 793.7,142" fill="#EC3EA6" />
    <Polygon points="669.7,70 704.7,70 705.7,105 775.7,106 739.7,105 704.7,70" fill="#EC3EA6" />
    <Polygon points="776.7,38 775.7,71 742.7,71 775.7,104 776.7,71 793.7,70 776.7,69" fill="#EC3EA6" />
    <Polygon points="706.7,35 740.7,69 740.7,35 768.7,34" fill="#EC3EA6" />
    <Polygon points="742.7,0 793.7,51 793.7,0" fill="#EC3EA6" />
    <Polygon points="635.7,0 668.7,33 668.7,0" fill="#EC3EA6" />

    {/* Purple triangles */}
    <Polygon points="778.7,107 793.7,122 793.7,107" fill="#5A1F8C" />
    <Polygon points="741.7,71 741.7,105 775.7,105" fill="#5A1F8C" />
    <Polygon points="777.7,36 777.7,69 793.7,69 793.7,52" fill="#5A1F8C" />
    <Polygon points="669.7,35 669.7,69 703.7,69" fill="#5A1F8C" />
    <Polygon points="741.7,0 741.7,33 774.7,34" fill="#5A1F8C" />
    <Polygon points="671.7,0 704.7,33 704.7,0" fill="#5A1F8C" />

    <Polygon points="0,951 310,1122.5 0,1122.5" fill="#602080" />
    <Polygon points="0,951 0,1030 252,1122.5 310,1122.5" fill="#602080" />
    <Polygon points="274,1122.5 793.7,1019 793.7,1122.5" fill="#e94ca2" />
    <Polygon
      points="311,1122.5 793.7,1027 793.7,1040 356,1122.5"
      fill="#ffffff"
    />
    <Polygon
      points="292,1122.5 793.7,1010 793.7,1019 309,1122.5"
      fill="#e94ca2"
    />
  </Svg>
);

export const BankStatementPDF = ({ data }: { data: StatementData }) => {
  const { accountHolder, period, summary, categories, transactions } = data;
  const curr = accountHolder.currency || "PKR";

  const formatAmount = (num: number = 0) =>
    `${curr} ${num.toLocaleString(undefined, {
      minimumFractionDigits: curr === "PKR" ? 0 : 2,
      maximumFractionDigits: 2,
    })}`;

  const DESCRIPTION_MAX_CHARS = 42;

  return (
    <Document
      title={`Bank Statement - ${period.statementRef}`}
      author="Personal Wallet"
      subject="Official Account Statement"
    >
      <Page size="A4" orientation="portrait" style={styles.page}>
        <PageDecoration />
        <View style={styles.headerContainer}>
          <View style={styles.brandRow}>
            <View>
              <Text style={styles.brandTitle}>PERSONAL WALLET</Text>
              <Text style={styles.brandSubtitle}>
                Bank Statement and Expense Tracker
              </Text>
            </View>
          </View>

          <View style={styles.headerMetaBox}>
            <View style={styles.statementDocBadge}>
              <Text style={styles.statementDocText}>
                {data.filterPerson
                  ? `STATEMENT — ${data.filterPerson.toUpperCase()}`
                  : "ACCOUNT STATEMENT"}
              </Text>
            </View>
            <Text style={styles.headerMetaLine}>
              Statement Ref:{" "}
              <Text style={styles.headerMetaLineBold}>{period.statementRef}</Text>
            </Text>
            <Text style={styles.headerMetaLine}>
              Issue Date:{" "}
              <Text style={styles.headerMetaLineBold}>{period.statementDate}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.accountBox}>
          <View style={styles.accountCol}>
            <Text style={styles.accountLabel}>Account Holder</Text>
            <Text style={styles.accountValue}>{accountHolder.name}</Text>
            <Text style={styles.accountSubtext}>{accountHolder.email}</Text>
          </View>

          <View style={styles.accountCol}>
            <Text style={styles.accountLabel}>Statement Period</Text>
            <Text style={styles.accountValue}>
              {period.startDate || "Beginning"} to {period.endDate || "Present"}
            </Text>
            <Text style={styles.accountSubtext}>Base Currency: {curr}</Text>
          </View>

          <View style={styles.accountCol}>
            <Text style={styles.accountLabel}>Activity Summary</Text>
            <Text style={styles.accountValue}>
              {summary.transactionCount} Total Transactions
            </Text>
            <Text style={styles.accountSubtext}>
              Net Flow: {summary.netCashFlow >= 0 ? "+" : ""}
              {formatAmount(summary.netCashFlow)}
            </Text>
          </View>

          <View style={styles.accountCol}>
            {data.filterPerson ? (
              <>
                <Text style={styles.accountLabel}>Counterparty / Person</Text>
                <Text style={[styles.accountValue, { color: PURPLE }]}>
                  {data.filterPerson}
                </Text>
                <Text style={styles.accountSubtext}>Filtered Individual Record</Text>
              </>
            ) : (
              <>
                <Text style={styles.accountLabel}>Account Standing</Text>
                <Text style={[styles.accountValue, { color: "#047857" }]}>
                  Active & Verified
                </Text>
                <Text style={styles.accountSubtext}>Reconciled Electronic Record</Text>
              </>
            )}
          </View>
        </View>

        {data.filterPerson ? (
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Opening Outstanding</Text>
              <Text style={styles.summaryCardValue}>
                {formatAmount(summary.openingBalance)}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Total Loans Given</Text>
              <Text style={styles.summaryCardValueRed}>
                -{formatAmount(summary.totalLoanGiven)}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Total Loans Returned</Text>
              <Text style={styles.summaryCardValueGreen}>
                +{formatAmount(summary.totalLoanReturned)}
              </Text>
            </View>

            <View style={styles.summaryCardDark}>
              <Text style={styles.summaryCardLabelDark}>Outstanding Balance</Text>
              <Text style={styles.summaryCardValueDark}>
                {formatAmount(summary.closingBalance)}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Settlement Status</Text>
              <Text
                style={[
                  styles.summaryCardValue,
                  {
                    color: summary.closingBalance === 0 ? "#047857" : "#d97706",
                  },
                ]}
              >
                {summary.closingBalance === 0 ? "Fully Settled" : "Pending Return"}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Opening Balance</Text>
              <Text style={styles.summaryCardValue}>
                {formatAmount(summary.openingBalance)}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Total Incomings</Text>
              <Text style={styles.summaryCardValueGreen}>
                +{formatAmount(summary.totalIncoming)}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Total Outgoings</Text>
              <Text style={styles.summaryCardValueRed}>
                -{formatAmount(summary.totalOutgoing)}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Loans Given</Text>
              <Text style={styles.summaryCardValueRed}>
                -{formatAmount(summary.totalLoanGiven)}
              </Text>
            </View>

            <View style={styles.summaryCard}>
              <Text style={styles.summaryCardLabel}>Loans Returned</Text>
              <Text style={styles.summaryCardValueGreen}>
                +{formatAmount(summary.totalLoanReturned)}
              </Text>
            </View>

            <View style={styles.summaryCardDark}>
              <Text style={styles.summaryCardLabelDark}>Closing Balance</Text>
              <Text style={styles.summaryCardValueDark}>
                {formatAmount(summary.closingBalance)}
              </Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionHeading}>
          {data.filterPerson
            ? `Transaction Ledger — ${data.filterPerson}`
            : "Transaction Ledger"}
        </Text>
        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.tableHeaderCell, styles.colDate]}>Date</Text>
            <Text style={[styles.tableHeaderCell, styles.colDesc]}>
              Description
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colCategory]}>
              Category
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colType]}>
              Movement
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colDebit]}>
              {data.filterPerson ? "Given" : "Debit"}
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colCredit]}>
              {data.filterPerson ? "Returned" : "Credit"}
            </Text>
            <Text style={[styles.tableHeaderCell, styles.colBalance]}>
              {data.filterPerson ? "Outstanding" : "Balance"}
            </Text>
          </View>

          <View style={styles.tableRowHighlight} wrap={false}>
            <Text style={[styles.cellTextBold, styles.colDate]}>
              {period.startDate || "Start"}
            </Text>
            <Text style={[styles.cellTextBold, styles.colDesc]}>
              {data.filterPerson ? "OPENING OUTSTANDING" : "OPENING BALANCE"}
            </Text>
            <Text style={[styles.cellText, styles.colCategory]}>—</Text>
            <Text style={[styles.cellTextBold, styles.colType]}>
              {data.filterPerson ? "Position" : "Balance"}
            </Text>
            <Text style={[styles.cellText, styles.colDebit]}>—</Text>
            <Text style={[styles.cellText, styles.colCredit]}>—</Text>
            <Text style={[styles.cellTextBold, styles.colBalance]}>
              {formatAmount(summary.openingBalance)}
            </Text>
          </View>

          {transactions && transactions.length > 0 ? (
            transactions.map((tx, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <View
                  key={tx.id || idx}
                  style={isEven ? styles.tableRow : styles.tableRowAlt}
                  wrap={false}
                >
                  <Text style={[styles.cellText, styles.colDate]}>
                    {tx.date}
                  </Text>
                  <Text style={[styles.cellText, styles.colDesc]}>
                    {tx.description.length > DESCRIPTION_MAX_CHARS
                      ? tx.description.slice(0, DESCRIPTION_MAX_CHARS - 2) + "..."
                      : tx.description}
                  </Text>
                  <Text style={[styles.cellText, styles.colCategory]}>
                    {tx.category}
                  </Text>
                  <View style={styles.colType}>
                    <Text
                      style={[
                        styles.badgeBase,
                        tx.type === "incoming"
                          ? styles.badgeGreen
                          : tx.type === "outgoing"
                            ? styles.badgePink
                            : tx.type === "loan"
                              ? styles.badgeAmber
                              : tx.type === "return"
                                ? styles.badgeGreen
                                : styles.badgePurple,
                      ]}
                    >
                      {tx.type === "incoming"
                        ? "Incoming"
                        : tx.type === "outgoing"
                          ? "Outgoing"
                          : tx.type === "loan"
                            ? "Loan Given"
                            : tx.type === "return"
                              ? "Loan Return"
                              : "Transfer"}
                    </Text>
                  </View>
                  <Text
                    style={[
                      tx.debit > 0 ? styles.debitText : styles.cellText,
                      styles.colDebit,
                    ]}
                  >
                    {tx.debit > 0 ? `-${formatAmount(tx.debit)}` : "—"}
                  </Text>
                  <Text
                    style={[
                      tx.credit > 0 ? styles.creditText : styles.cellText,
                      styles.colCredit,
                    ]}
                  >
                    {tx.credit > 0 ? `+${formatAmount(tx.credit)}` : "—"}
                  </Text>
                  <Text style={[styles.cellTextBold, styles.colBalance]}>
                    {formatAmount(tx.runningBalance)}
                  </Text>
                </View>
              );
            })
          ) : (
            <View style={styles.tableRow} wrap={false}>
              <Text style={styles.emptyState}>
                No financial transactions recorded during this statement period.
              </Text>
            </View>
          )}

          <View style={styles.tableRowClosing} wrap={false}>
            <Text style={[styles.cellTextBold, styles.colDate]}>
              {period.endDate || "End"}
            </Text>
            <Text style={[styles.cellTextBold, styles.colDesc]}>
              {data.filterPerson ? "CLOSING OUTSTANDING" : "CLOSING BALANCE"}
            </Text>
            <Text style={[styles.cellText, styles.colCategory]}>—</Text>
            <Text style={[styles.cellTextBold, styles.colType]}>
              {data.filterPerson ? "Position" : "Balance"}
            </Text>
            <Text style={[styles.debitText, styles.colDebit]}>
              {summary.totalDebit > 0 ? `-${formatAmount(summary.totalDebit)}` : "—"}
            </Text>
            <Text style={[styles.creditText, styles.colCredit]}>
              {summary.totalCredit > 0 ? `+${formatAmount(summary.totalCredit)}` : "—"}
            </Text>
            <Text
              style={[
                styles.cellTextBold,
                styles.colBalance,
                { color: PURPLE },
              ]}
            >
              {formatAmount(summary.closingBalance)}
            </Text>
          </View>
        </View>

        {categories && categories.length > 0 && !data.filterPerson && (
          <View wrap={false}>
            <Text style={styles.sectionHeading}>Current Category Balances</Text>
            <View style={styles.categoryBox}>
              <View style={styles.categoryRow}>
                {categories.slice(0, 5).map((cat, idx, arr) => (
                  <View
                    key={cat.id}
                    style={
                      idx === arr.length - 1
                        ? styles.categoryColLast
                        : styles.categoryCol
                    }
                  >
                    <Text style={styles.categoryLabel}>{cat.name}</Text>
                    <Text style={styles.categoryVal}>
                      {formatAmount(cat.balance)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </Page>
    </Document>
  );
};

export default BankStatementPDF;