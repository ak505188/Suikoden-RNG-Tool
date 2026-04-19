import React, { useRef, useState } from 'react';
import {
  Button,
  Form,
  Message,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from 'semantic-ui-react';

const ImportModal = ({ local_storage_prefix, importData, trigger }) => {
  const fileInputRef = useRef(null);
  const [imports, setImports] = useState(getLocalStorageByPrefix(local_storage_prefix));

  const refresh = () => setImports(getLocalStorageByPrefix(local_storage_prefix));

  const clearLocalStorageKey = key => {
    localStorage.removeItem(key);
    refresh();
  };

  const handleImport = data => importData(data);

  const fileInputHandleChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const json = JSON.parse(event.target.result);
        handleImport(json);
      }
      reader.readAsText(file);
    }
  }

  return (
    <Modal onOpen={refresh} trigger={trigger}>
      <Modal.Header>
        Import
      </Modal.Header>
      <Modal.Content>
        <Form>
          {Object.keys(imports).length > 0 ?
            <Table celled definition>
              <TableBody>
              {Object.entries(imports).map(([name, data], index)=> (
                <TableRow key={index}>
                  <TableCell collapsing>{stripPrefix(name, local_storage_prefix)}</TableCell>
                  <TableCell>
                    {data.characters.map(character => character.name).join(', ')}
                  </TableCell>
                  <TableCell collapsing>
                    <Button content="Import" onClick={() => handleImport(data)}/>
                  </TableCell>
                  <TableCell collapsing>
                    <Button content="Delete" onClick={() => clearLocalStorageKey(name)}/>
                  </TableCell>
                </TableRow>
              ))}
              </TableBody>
            </Table> :
            <Message>Nothing saved in Local Storage.</Message>
          }
          <Form.Group inline={true}>
            <Button
              content="Import JSON File"
              labelPosition="left"
              icon="file"
              onClick={() => fileInputRef.current.click()}
              primary={true}
            />
            <input
              type="file"
              ref={fileInputRef}
              hidden
              accept=".json"
              onChange={fileInputHandleChange}
            />
            <Form.Button content='Refresh' primary={true} onClick={refresh}/>
          </Form.Group>
        </Form>
      </Modal.Content>
    </Modal>
  );
};

function stripPrefix(key, prefix) {
  return key.slice(prefix.length + 1);
}

function getLocalStorageByPrefix(prefix, stripPrefix = false) {
  const table = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key && key.startsWith(prefix)) {
      let value = localStorage.getItem(key);

      try {
        value = JSON.parse(value);
      } catch {}

      // const finalKey = stripPrefix ? key.slice(prefix.length + 1) : key;
      // table[finalKey] = value;
      table[key] = value;
    }
  }

  return table;
}

export default ImportModal;
