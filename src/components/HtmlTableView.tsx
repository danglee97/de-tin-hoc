import React from 'react';

interface HtmlTableViewProps {
  htmlContent: string;
}

export const HtmlTableView: React.FC<HtmlTableViewProps> = ({ htmlContent }) => {
  // Inject styles directly to ensure they are scoped to this component's output
  // and are not purged by any build process. This is safer for dynamic HTML.
  const styles = `
    .html-table-container {
      overflow-x: auto;
    }
    .html-table-container table {
      width: 100%;
      min-width: 600px;
      border-collapse: collapse;
      font-size: 0.875rem; /* text-sm */
    }
    .html-table-container th, .html-table-container td {
      border: 1px solid var(--color-border, #e2e8f0);
      padding: 0.75rem; /* p-3 */
      text-align: left;
      vertical-align: top;
      color: var(--color-text-secondary, #475569);
    }
    .html-table-container th {
      background-color: #f8fafc; /* slate-50 */
      font-weight: 600; /* font-semibold */
      color: var(--color-text-primary, #0f172a);
    }
    .html-table-container tr:hover td {
       background-color: #f8fafc; /* slate-50 */
    }
  `;

  return (
    <>
      <style>{styles}</style>
      <div 
        className="html-table-container"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    </>
  );
};