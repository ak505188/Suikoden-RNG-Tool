import React, { useState } from 'react';
import { Form, Modal } from 'semantic-ui-react';
import FileSaver from 'file-saver';

const ExportModal = props => {
  const [formatType, setFormatType] = useState('csv');
  const [copySuccess, setCopySuccess] = useState('');
  const handleFormatChange = (e, { value }) => setFormatType(value);
  const [fileName, setFileName] = useState('');

  const copyToClipboard = () => {
    const text = dataToText();
    navigator.clipboard.writeText(text)
      .then(() => setCopySuccess('Copied!'), () => setCopySuccess('Failure.'));
    setTimeout(() => setCopySuccess(''), 3000);
  }

  const dataToText = () => {
    if (formatType === 'csv') {
      const columns = props.columns.filter(column => column.show !== false);
      const csv = [];
      csv.push(columns.map(column => column.label).join());

      const rows = props.data.map(row => {
        const rowData = [];
        columns.forEach(column => rowData.push(row[column.key]));
        return rowData.join();
      }).join('\r\n');

      csv.push(rows);
      return csv.join('\r\n');
    }
    return JSON.stringify(props.data, null, 2);
  }


  const download = () => {
    let blobData = dataToText();
    let mimeType = formatType === 'json'
      ? 'application/json;charset=utf-8'
      : 'text/csv;charset=utf-8;'

    const fileBlob = new Blob([blobData], { type: mimeType });
    FileSaver.saveAs(fileBlob, `${fileName}.${formatType}`);
  }

  return (
    <Modal trigger={props.trigger}>
      <Modal.Header>
        Export Table
      </Modal.Header>
      <Modal.Content>
        <Form>
          <Form.Group inline={true}>
            <Form.Radio
              label='CSV'
              value='csv'
              checked={formatType === 'csv'}
              onChange={handleFormatChange}
            />
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
          </Form.Group>
        </Form>
      </Modal.Content>
    </Modal>
  );
};

export default ExportModal;
