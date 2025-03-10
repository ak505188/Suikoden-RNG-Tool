import * as React from 'react';
import VirtTable from '../Table';
import { Container } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { selectFight } from './actions/RunAssistant';
import { getCurrentFights } from './reducers/RunAssistant';
import { Helpers } from 'suikoden-rng-lib';

const mapStateToProps = state => ({
  fights: getCurrentFights(state.RunAssistant),
  currentRow: state.RunAssistant.index,
  columns: state.config.columns,
  headerHeight: state.config.table.headerHeight,
  rowHeight: state.config.table.rowHeight,
  rowStyle: { ...state.config.table.rowStyle, fontSize: `${state.config.table.rowStyle.fontSize}px` }
});

const mapDispatchToProps = {
  selectFight
};

const RunAssistantTable = props => {
  const columns =  props.columns;
  const fights = props.fights.map(fight => ({
    ...fight,
    enemyGroup: fight.enemyGroup.name,
    enemyGroupImage: (
      <div style={{ height: props.rowHeight }} className="enemyGroupImage">
        {
          fight.enemyGroup.enemies.map((enemy, index) => (
            <img style={{ height: props.rowHeight }} className="enemyImage" alt="" key={index} src={`data:image/png;base64, ${enemy.img}`}/>
          ))
        }
      </div>
    ),
    run: fight.run ? 'Run' : 'Fail',
    startRNG: Helpers.numToHexString(fight.startRNG),
    battleRNG: Helpers.numToHexString(fight.battleRNG),
    champVal: fight.enemyGroup.champVal
  }));

  return (
    <Container textAlign="center" style={{ display: 'block', height: '100%' }}>
      <VirtTable
        currentRow={props.currentRow}
        columns={columns}
        data={fights}
        filter={true}
        filterFromData={['enemyGroupImage']}
        headerHeight={props.headerHeight}
        onRowClick={index => props.selectFight(index)}
        rowHeight={props.rowHeight}
        rowStyle={props.rowStyle}
      />
    </Container>
  );
};

export const ConnectedTable = connect(mapStateToProps, mapDispatchToProps)(RunAssistantTable);
