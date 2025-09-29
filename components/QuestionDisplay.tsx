import React, { useMemo, useState, useCallback } from 'react';
import type * as DOCX from 'docx';
import { GeneratedExam, Question, ExamQuestion, ExamAnswer, QuestionType } from '../types';
import { QuestionCard } from './QuestionCard';
import { HtmlTableView } from './HtmlTableView';
import { ClipboardListIcon, DownloadIcon, SpinnerIcon, PrinterIcon } from './icons';

// A new, highly defensive sanitization function to create a "crash-proof" version of the exam data.
// It rebuilds the entire object from scratch, ensuring every property is safe to use.
const sanitizeExamData = (exam: GeneratedExam | null): GeneratedExam | null => {
    if (!exam || typeof exam !== 'object') {
        return null;
    }

    // Sanitize matrix and spec (ensure they are strings)
    const matrix = typeof exam.matrix === 'string' ? exam.matrix : '';
    const specification = typeof exam.specification === 'string' ? exam.specification : '';

    // Sanitize exam questions array by rebuilding it safely
    const safeExamQuestions = (Array.isArray(exam.exam) ? exam.exam : [])
        .filter(q => q && typeof q === 'object') // Filter out null/undefined/non-object items
        .map(q => {
            // Rebuild the question object defensively
            const question_id = String(q.question_id ?? '');
            const question_text = String(q.question_text ?? '');
            const question_type = String(q.question_type ?? '');

            // Defensively rebuild the options array to guarantee it's an array of strings
            const options = (Array.isArray(q.options) ? q.options : [])
                .filter(opt => opt != null && typeof opt !== 'object') // Filter out null, undefined, and objects
                .map(opt => String(opt)); // Ensure every valid item is a string

            return { question_id, question_text, question_type, options };
        });

    // Sanitize the answer key array by rebuilding it safely
    const safeAnswerKey = (Array.isArray(exam.answer_key) ? exam.answer_key : [])
        .filter(ans => ans && typeof ans === 'object') // Ensure answer is a non-null object
        .map(ans => ({
            // Rebuild the answer object defensively
            question_id: String(ans.question_id ?? ''),
            answer: String(ans.answer ?? ''),
            explanation: String(ans.explanation ?? ''),
        }));

    return {
        matrix,
        specification,
        exam: safeExamQuestions,
        answer_key: safeAnswerKey,
    };
};

// Function to map sanitized exam data to UI question objects.
const mapExamToQuestions = (examQuestions: ExamQuestion[], answerKey: ExamAnswer[]): Question[] => {
    const answerMap = new Map(answerKey.map(ans => [ans.question_id, ans.answer]));
    
    return examQuestions
        .map(q => {
        const answer = answerMap.get(q.question_id);
        if (answer === undefined) {
            console.warn(`No answer found for question ${q.question_id}`);
            return null;
        }

        switch (q.question_type) {
            case QuestionType.MULTIPLE_CHOICE:
                return {
                    question: q.question_text,
                    options: q.options, // Already guaranteed to be a string[] by sanitizer
                    answer: answer
                };
            case QuestionType.TRUE_FALSE:
                return {
                    question: q.question_text,
                    answer: answer.toLowerCase() === 'true' || answer === 'Đúng'
                };
            case QuestionType.SHORT_ANSWER:
                 return {
                    question: q.question_text,
                    answer: answer
                };
            default:
                console.warn(`Unknown question type: ${q.question_type}`);
                return null;
        }
    }).filter((q): q is Question => q !== null);
};

// FIX: Define props interface for QuestionDisplay component to resolve TypeScript error.
interface QuestionDisplayProps {
  isLoading: boolean;
  error: string | null;
  exam: GeneratedExam | null;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ isLoading, error, exam }) => {
  const [activeTab, setActiveTab] = useState('exam');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  const TABS = {
    exam: "Đề thi",
    answers: "Đáp án",
    matrix: "Ma trận",
    specification: "Đặc tả",
  };

  const [downloadOptions, setDownloadOptions] = useState<Record<keyof typeof TABS, boolean>>({
    matrix: true,
    specification: true,
    exam: true,
    answers: true,
  });

  const sanitizedExam = useMemo(() => sanitizeExamData(exam), [exam]);

  const questions = useMemo(() => {
    if (!sanitizedExam) return [];
    return mapExamToQuestions(sanitizedExam.exam, sanitizedExam.answer_key);
  }, [sanitizedExam]);

  const handleDownloadOptionChange = (option: keyof typeof downloadOptions) => {
    setDownloadOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  const generateDocumentHtml = useCallback(() => {
    if (!sanitizedExam) return '';
    
    const documentStyles = `
        <style>
            body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; }
            h1 { font-size: 16pt; color: #2d3748; }
            p { margin-bottom: 10px; line-height: 1.5; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #cccccc; padding: 6px; text-align: left; vertical-align: top; }
            th { background-color: #f2f2f2; font-weight: bold; }
            ol { margin: 0; padding-left: 40px; }
            li { margin-bottom: 5px; }
            .no-break { page-break-inside: avoid; }
            @media print {
              h1, h2, h3 { page-break-after: avoid; }
              table { page-break-inside: auto; }
              tr { page-break-inside: avoid; page-break-after: auto; }
            }
        </style>
    `;

    let content = `
        <!DOCTYPE html>
        <html lang="vi">
        <head><meta charset="UTF-8"><title>Đề thi</title>${documentStyles}</head>
        <body>
    `;
    
    if (downloadOptions.matrix) {
        content += `<div class="no-break"><h1>MA TRẬN ĐỀ KIỂM TRA</h1>${sanitizedExam.matrix}</div>`;
    }
    if (downloadOptions.specification) {
        content += `<div class="no-break"><h1>BẢN ĐẶC TẢ ĐỀ KIỂM TRA</h1>${sanitizedExam.specification}</div>`;
    }
    if (downloadOptions.exam) {
        content += `<div class="no-break"><h1>ĐỀ THI</h1>`;
        sanitizedExam.exam.forEach((q, index) => {
            content += `<p><strong>Câu ${index + 1}:</strong> ${q.question_text}</p>`;
            if (q.question_type === 'MULTIPLE_CHOICE') {
                content += '<ol type="A">';
                q.options.forEach((opt) => {
                    content += `<li>${opt.replace(/^[A-ZĐ]\.\s*/, '')}</li>`;
                });
                content += '</ol>';
            }
        });
        content += `</div>`;
    }
    if (downloadOptions.answers) {
        content += `<div class="no-break"><h1>ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM</h1>`;
        sanitizedExam.answer_key.forEach((ans, index) => {
            const questionNumber = index + 1;
            content += `<p><strong>Câu ${questionNumber}:</strong> ${ans.answer}</p>`;
            if (ans.explanation) {
                content += `<p style="font-style: italic;">Giải thích: ${ans.explanation}</p>`;
            }
        });
        content += `</div>`;
    }

    content += '</body></html>';
    return content;
  }, [sanitizedExam, downloadOptions]);

  const handleDownload = async () => {
    if (!sanitizedExam) return;
    setIsDownloading(true);
    
    try {
        const docx = await import('docx');

        const parseHtmlTableToDocx = (htmlString: string): DOCX.Table | null => {
            if (!htmlString || !htmlString.trim()) return null;
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlString, "text/html");
            const tableNode = doc.querySelector("table");
            if (!tableNode) return null;

            const docxRows = Array.from(tableNode.querySelectorAll("tr")).map((tr) => {
                const docxCells = Array.from(tr.querySelectorAll("td, th")).map((td) => {
                    const colspan = td.getAttribute("colspan");
                    const rowspan = td.getAttribute("rowspan");
                    return new docx.TableCell({
                        children: [new docx.Paragraph({ text: td.textContent || "", style: td.nodeName === 'TH' ? 'tableHeader' : undefined })],
                        columnSpan: colspan ? parseInt(colspan, 10) : 1,
                        rowSpan: rowspan ? parseInt(rowspan, 10) : 1,
                    });
                });
                return new docx.TableRow({ children: docxCells });
            });

            return new docx.Table({
                rows: docxRows,
                width: { size: 100, type: docx.WidthType.PERCENTAGE },
                borders: {
                    top: { style: docx.BorderStyle.SINGLE, size: 1, color: "D3D3D3" },
                    bottom: { style: docx.BorderStyle.SINGLE, size: 1, color: "D3D3D3" },
                    left: { style: docx.BorderStyle.SINGLE, size: 1, color: "D3D3D3" },
                    right: { style: docx.BorderStyle.SINGLE, size: 1, color: "D3D3D3" },
                    insideHorizontal: { style: docx.BorderStyle.SINGLE, size: 1, color: "D3D3D3" },
                    insideVertical: { style: docx.BorderStyle.SINGLE, size: 1, color: "D3D3D3" },
                }
            });
        };
        
        const docChildren: (DOCX.Paragraph | DOCX.Table)[] = [];

        if (downloadOptions.matrix && sanitizedExam.matrix) {
            docChildren.push(new docx.Paragraph({ text: "MA TRẬN ĐỀ KIỂM TRA", heading: docx.HeadingLevel.HEADING_1, alignment: docx.AlignmentType.CENTER }));
            const table = parseHtmlTableToDocx(sanitizedExam.matrix);
            if (table) docChildren.push(table);
            docChildren.push(new docx.Paragraph(""));
        }
        if (downloadOptions.specification && sanitizedExam.specification) {
            docChildren.push(new docx.Paragraph({ text: "BẢN ĐẶC TẢ ĐỀ KIỂM TRA", heading: docx.HeadingLevel.HEADING_1, alignment: docx.AlignmentType.CENTER }));
            const table = parseHtmlTableToDocx(sanitizedExam.specification);
            if (table) docChildren.push(table);
            docChildren.push(new docx.Paragraph(""));
        }
        if (downloadOptions.exam) {
            docChildren.push(new docx.Paragraph({ text: "ĐỀ THI", heading: docx.HeadingLevel.HEADING_1, alignment: docx.AlignmentType.CENTER, pageBreakBefore: (downloadOptions.matrix || downloadOptions.specification) }));
            sanitizedExam.exam.forEach((q, index) => {
                docChildren.push(new docx.Paragraph({
                    children: [
                        new docx.TextRun({ text: `Câu ${index + 1}: `, bold: true }),
                        new docx.TextRun(q.question_text),
                    ],
                }));
                if (q.question_type === 'MULTIPLE_CHOICE' && q.options) {
                    q.options.forEach((opt, optIndex) => {
                        const letter = String.fromCharCode(65 + optIndex);
                        docChildren.push(new docx.Paragraph({
                            text: `${letter}. ${opt.replace(/^[A-ZĐ]\.\s*/, '')}`,
                            style: "options"
                        }));
                    });
                }
                 docChildren.push(new docx.Paragraph(""));
            });
        }
        if (downloadOptions.answers) {
            docChildren.push(new docx.Paragraph({ text: "ĐÁP ÁN VÀ HƯỚNG DẪN CHẤM", heading: docx.HeadingLevel.HEADING_1, alignment: docx.AlignmentType.CENTER, pageBreakBefore: downloadOptions.exam }));
            sanitizedExam.answer_key.forEach((ans, index) => {
                docChildren.push(new docx.Paragraph({
                    children: [
                        new docx.TextRun({ text: `Câu ${index + 1}: `, bold: true }),
                        new docx.TextRun({ text: ans.answer }),
                    ],
                }));
                if (ans.explanation) {
                    docChildren.push(new docx.Paragraph({
                        children: [ new docx.TextRun({ text: `Giải thích: ${ans.explanation}`, italics: true })],
                    }));
                }
            });
        }
        
        const doc = new docx.Document({
            styles: {
                paragraphStyles: [{
                    id: "tableHeader",
                    name: "Table Header",
                    basedOn: "Normal",
                    next: "Normal",
                    run: { bold: true },
                }, {
                    id: "options",
                    name: "Exam Options",
                    basedOn: "Normal",
                    next: "Normal",
                    paragraph: {
                        indent: { left: 720, hanging: 360 },
                    },
                }]
            },
            sections: [{ children: docChildren }],
        });

        const blob = await docx.Packer.toBlob(doc);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'de-kiem-tra.docx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (e) {
        console.error("Error generating DOCX file with 'docx' library:", e);
        const errorMessage = e instanceof Error ? e.message : "Đã xảy ra lỗi khi tạo file .docx. Vui lòng thử lại.";
        alert(`Lỗi tạo DOCX: ${errorMessage}`);
    } finally {
        setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    if (!sanitizedExam) return;
    setIsPrinting(true);
    try {
        const content = generateDocumentHtml();
        if (!content) return;
        
        const printWindow = window.open('', '_blank');
        if (printWindow) {
            printWindow.document.write(content);
            printWindow.document.close();
            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }, 500);
        } else {
            alert('Vui lòng cho phép cửa sổ pop-up để in tài liệu.');
        }

    } catch (e) {
        console.error("Error preparing for print:", e);
        alert("Đã xảy ra lỗi khi chuẩn bị in. Vui lòng thử lại.");
    } finally {
        setIsPrinting(false);
    }
  };
  
  const getTabClass = (tabName: string) => {
    return activeTab === tabName
      ? 'border-[var(--color-primary-600)] text-[var(--color-primary-600)] bg-[var(--color-primary-50)]'
      : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300';
  };
  
  const containerStyles = "bg-white rounded-[var(--border-radius-lg)] shadow-[var(--shadow-md)] border border-slate-200";

  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center p-8 text-center min-h-[30rem] ${containerStyles}`}>
        <SpinnerIcon className="w-12 h-12 text-[var(--color-primary-600)] animate-spin" />
        <p className="mt-4 text-lg font-semibold text-slate-700">Đang tạo đề thi...</p>
        <p className="text-slate-500">AI đang làm việc, vui lòng chờ trong giây lát.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[var(--color-error-bg)] p-6 rounded-lg border border-[var(--color-error-border)]">
        <h3 className="text-xl font-bold text-[var(--color-error-text)]">Đã xảy ra lỗi</h3>
        <p className="text-red-700 mt-2">{error}</p>
      </div>
    );
  }

  if (!sanitizedExam) {
    return (
      <div className={`flex flex-col items-center justify-center p-12 text-center min-h-[30rem] ${containerStyles}`}>
        <ClipboardListIcon className="w-16 h-16 text-slate-300 mb-4" />
        <h3 className="text-xl font-bold text-slate-700">Sẵn sàng tạo đề thi</h3>
        <p className="text-slate-500 mt-2 max-w-md">
            Sử dụng biểu mẫu bên cạnh để nhập các tiêu chí và AI sẽ tạo ra một đề thi hoàn chỉnh cho bạn.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className={containerStyles}>
        <div className="border-b border-slate-200 px-4">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
             {(Object.keys(TABS) as Array<keyof typeof TABS>).map(tabKey => (
              <button
                key={tabKey}
                onClick={() => setActiveTab(tabKey)}
                className={`whitespace-nowrap py-3 px-3 border-b-2 font-semibold text-sm rounded-t-md transition-colors ${getTabClass(tabKey)}`}
              >
                {TABS[tabKey]}
              </button>
            ))}
          </nav>
        </div>
        
        <div className="p-4 md:p-6">
          {activeTab === 'exam' && (
             <div className="space-y-6">
                {questions.map((q, index) => (
                  <QuestionCard key={index} question={q} index={index + 1} />
                ))}
              </div>
          )}
          {activeTab === 'answers' && (
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-slate-800 pb-2 mb-4 border-b border-slate-200">Đáp án và Hướng dẫn chấm</h3>
              {sanitizedExam.answer_key.map((ans, index) => (
                <div key={ans.question_id} className="p-3 bg-slate-50 rounded-md border border-slate-200">
                  <p className="font-bold text-slate-700">
                    Câu {index + 1}: <span className="font-medium text-[var(--color-success)]">{ans.answer}</span>
                  </p>
                  {ans.explanation && (
                    <p className="mt-1 text-sm text-slate-500 italic">
                      <strong>Giải thích:</strong> {ans.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
          {activeTab === 'matrix' && <HtmlTableView htmlContent={sanitizedExam.matrix} />}
          {activeTab === 'specification' && <HtmlTableView htmlContent={sanitizedExam.specification} />}
        </div>
      </div>
      
      <div className={containerStyles}>
        <div className="p-6">
          <h3 className="text-lg font-bold text-slate-800 mb-4">Tải xuống tài liệu</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
            {(Object.keys(TABS) as Array<keyof typeof TABS>).map((key) => (
              <label key={key} className="flex items-center space-x-2 cursor-pointer custom-checkbox-container">
                <input
                  type="checkbox"
                  checked={downloadOptions[key as keyof typeof TABS]}
                  onChange={() => handleDownloadOptionChange(key as keyof typeof TABS)}
                  className="sr-only"
                />
                <span className="custom-checkbox-visual" aria-hidden="true"></span>
                <span className="text-sm text-slate-600 font-medium">
                  {TABS[key as keyof typeof TABS]}
                </span>
              </label>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 border-t border-slate-200 pt-5">
             <button
                onClick={handleDownload}
                disabled={isDownloading || Object.values(downloadOptions).every(v => !v)}
                className="w-full flex justify-center items-center px-4 py-2.5 bg-[var(--color-primary-600)] text-white rounded-md font-semibold shadow-sm hover:bg-[var(--color-primary-700)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] focus:ring-offset-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {isDownloading ? (
                  <>
                    <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    Tải về (.docx)
                  </>
                )}
              </button>
              <button
                onClick={handlePrint}
                disabled={isPrinting || Object.values(downloadOptions).every(v => !v)}
                className="w-full flex justify-center items-center px-4 py-2.5 bg-slate-600 text-white rounded-md font-semibold shadow-sm hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
              >
                {isPrinting ? (
                  <>
                    <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5" />
                    Đang chuẩn bị...
                  </>
                ) : (
                  <>
                    <PrinterIcon className="w-5 h-5 mr-2" />
                    In / Lưu PDF
                  </>
                )}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};