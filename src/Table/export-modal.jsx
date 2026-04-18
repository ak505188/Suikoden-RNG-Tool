import React, { useState } from 'react';
import { Form, Modal } from 'semantic-ui-react';
import FileSaver from 'file-saver';

const ExportModal = ({ columns, data, local_storage_prefix, trigger }) => {
  const defaultFormat = columns ? 'csv' : 'json';
  const [formatType, setFormatType] = useState(defaultFormat);
  const [copySuccess, setCopySuccess] = useState('');
  const handleFormatChange = (_, { value }) => setFormatType(value);
  const [fileName, setFileName] = useState('');

  const copyToClipboard = () => {
    const text = dataToText();
    navigator.clipboard.writeText(text)
      .then(() => setCopySuccess('Copied!'), () => setCopySuccess('Failure.'));
    setTimeout(() => setCopySuccess(''), 3000);
  }

  const dataToText = () => {
    if (formatType === 'csv') {
      const cols = columns.filter(column => column.show !== false);
      const csv = [];
      csv.push(cols.map(column => column.label).join());

      const rows = data.map(row => {
        const rowData = [];
        cols.forEach(column => rowData.push(row[column.key]));
        return rowData.join();
      }).join('\r\n');

      csv.push(rows);
      return csv.join('\r\n');
    }
    return JSON.stringify(data, null, 2);
  }


  const download = () => {
    let blobData = dataToText();
    let mimeType = formatType === 'json'
      ? 'application/json;charset=utf-8'
      : 'text/csv;charset=utf-8;'

    const fileBlob = new Blob([blobData], { type: mimeType });
    window.showSaveFilePicker()
    FileSaver.saveAs(fileBlob, `${fileName}.${formatType}`);
  }

  const saveToLocalStorage = () => {
    const data_str = JSON.stringify(data);
    localStorage.setItem(`${local_storage_prefix}_${fileName}`, data_str);
  }

  return (
    <Modal trigger={trigger}>
      <Modal.Header>
        Export Table
      </Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Group inline={true}>
            {columns &&
            <Form.Radio
              label='CSV'
              value='csv'
              checked={formatType === 'csv'}
              onChange={handleFormatChange}
            />
            }
            <Form.Radio
              label='JSON'
              value='json'
              checked={formatType === 'json'}
              onChange={handleFormatChange}
            />
            <Form.Button color='green' content='Copy to Clipboard' onClick={copyToClipboard}/>
            <span>{copySuccess}</span>
          </Form.Group>
          <Form.Group inline={true}>
            <Form.Input
              label='Filename'
              type='text'
              placeholder='Filename'
              value={fileName}
              onChange={e => setFileName(e.target.value)}
            />
            <Form.Button content='Download' primary={true} onClick={download}/>
            {local_storage_prefix &&
              <Form.Button content='Save to Local Storage' primary={false} onClick={saveToLocalStorage}/>
            }
          </Form.Group>
        </Form>
      </Modal.Content>
    </Modal>
  );
};

export default ExportModal;
