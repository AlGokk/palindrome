import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import moment from "moment";
import logo from "./logo-palindrome-crypto-escrow.png";

const createData = (data: any) => {
  const result: any[] = [];
  data.map((item: any) => {
    return result.push([
      item.id,
      item.from,
      item.to,
      item.title,
      item.amount,
      item.currency,
    ]);
  });
  return result;
};

export const printTable = (input: any) => {
  const data = createData(input);

  const doc = new jsPDF("l", "mm", "a4");
  const head = [["ID", "From", "To", "Title", "Amount", "Currency"]];

  let img = new Image();
  img.src = logo;

  doc.addImage(img, "png", 10, 5, 80, 0);
  doc.text(
    `Palindrome Transactions Report - ${moment().format("MMM Do YYYY")}`,
    100,
    30
  );
  autoTable(doc, {
    startY: 40,
    head: head,
    body: data,
    didDrawCell: (data) => {},
  });

  doc.save(`PalindromeReport-${moment().format("MMM-Do-YYYY")}.pdf`);
};
