const fs = require( 'fs' );
const readline = require( 'readline' );

const confirmed = './COVID-19/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_confirmed_global.csv';
const deaths = './COVID-19/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_deaths_global.csv';
const recovered = './COVID-19/csse_covid_19_data/csse_covid_19_time_series/time_series_covid19_recovered_global.csv';

const forBrowser = {
  labels: undefined,
  confUSA: undefined,
  confItaly: undefined,
  confSA: undefined,
  confDailyUSA: [],
  confDailyItaly: [],
  confDailySA: [], 

  deathsUSA: undefined,
  deathsItaly: undefined,
  deathsSA: undefined,
  deathsDailyUSA: [],
  deathsDailyItaly: [],
  deathsDailySA: [],

  recoveredUSA: undefined,
  recoveredItaly: undefined,
  recoveredSA: undefined,
  recoveredDailyUSA: [],
  recoveredDailyItaly: [],
  recoveredDailySA: [], 

  currentUSA: [],
  currentItaly: [],
  currentSA: [], 
};

function clean( d ) {
  fs.readdirSync(d)
  .forEach( item => {
    const curPath = d + "/" + item;
    if ( fs.lstatSync(curPath).isDirectory() ) { 
      rmdirSync(curPath);
    } 
    else {
      fs.unlinkSync(curPath);
    }
  });
}


function compileConfirmed() {
  return new Promise(( resolve, reject ) => {
    const confStream = fs.createReadStream( confirmed );
    const rl = readline.createInterface({ input: confStream });

    let count = 0;
    

    let first = true;
    let headings;
    let sums; // USA
    let italy;
    let sa;
    rl.on( 'line', line => {
      if ( first ) {
        // Province/State,Country/Region,Lat,Long,1/22/20,1/2
        headings = line.split( ',' );
        sums = new Array( headings.length );
        italy = new Array( headings.length );
        sa = new Array( headings.length );
        first = false;
        forBrowser.labels = headings.slice(4);
      }
      if ( /US/g.test( line ) && !/"/.test( line )) {
        count++;
        const spline = line.split(',');
        for ( let i = 4; i < headings.length; i++ ) {
          if ( !sums[i] ) sums[i] = 0;
          sums[i] = sums[i] + parseInt( spline[i] );
        }
        forBrowser.confUSA = sums.slice(4);
      }
      if ( /Italy/g.test( line ) ) {
        const spline = line.split(',');
        for ( let i = 4; i < headings.length; i++ ) {
          if ( !italy[i] ) italy[i] = 0;
          italy[i] = italy[i] + parseInt( spline[i] );
        }
        forBrowser.confItaly = italy.slice(4);
      }
      if ( /South Africa/g.test( line ) ) {
        const spline = line.split(',');
        for ( let i = 4; i < headings.length; i++ ) {
          if ( !sa[i] ) sa[i] = 0;
          sa[i] = sa[i] + parseInt( spline[i] );
        }
        forBrowser.confSA = sa.slice(4);
      }
    });

    rl.on( 'close', () => {
      console.log( 'us count', count )
      let prevUS = 0;
      let prevItaly = 0;
      let prevSA = 0;
      for ( let i = 4; i < headings.length; i++ ) {
        forBrowser.confDailyUSA.push( sums[i] - prevUS )
        prevUS = sums[i];
        forBrowser.confDailyItaly.push( italy[i] - prevItaly )
        prevItaly = italy[i];
        forBrowser.confDailySA.push( sa[i] - prevSA )
        prevSA = sa[i];
      }
      resolve();
    });
    
    rl.on( 'error', error => {
      reject( error );
    });
  });
}

function compileDeaths() {
  return new Promise(( resolve, reject ) => {
    const confStream = fs.createReadStream( deaths );
    const rl = readline.createInterface({ input: confStream });

    let first = true;
    let headings;
    let sums; // USA
    let italy;
    let sa;
    rl.on( 'line', line => {
      if ( first ) {
        // Province/State,Country/Region,Lat,Long,1/22/20,1/2
        headings = line.split( ',' );
        sums = new Array( headings.length );
        italy = new Array( headings.length );
        sa = new Array( headings.length );
        first = false;
      }
      if ( /US/g.test( line ) && !/"/.test( line )) {
        const spline = line.split(',');
        for ( let i = 4; i < headings.length; i++ ) {
          if ( !sums[i] ) sums[i] = 0;
          sums[i] = sums[i] + parseInt( spline[i] );
        }
        forBrowser.deathsUSA = sums.slice(4);
      }
      if ( /Italy/g.test( line ) ) {
        const spline = line.split(',');
        for ( let i = 4; i < headings.length; i++ ) {
          if ( !italy[i] ) italy[i] = 0;
          italy[i] = italy[i] + parseInt( spline[i] );
        }
        forBrowser.deathsItaly = italy.slice(4);
      }
      if ( /South Africa/g.test( line ) ) {
        const spline = line.split(',');
        for ( let i = 4; i < headings.length; i++ ) {
          if ( !sa[i] ) sa[i] = 0;
          sa[i] = sa[i] + parseInt( spline[i] );
        }
        forBrowser.deathsSA = sa.slice(4);
      }
    });

    rl.on( 'close', () => {
      let prevUS = 0;
      let prevItaly = 0;
      let prevSA = 0;
      for ( let i = 4; i < headings.length; i++ ) {
        forBrowser.deathsDailyUSA.push( sums[i] - prevUS )
        prevUS = sums[i];
        forBrowser.deathsDailyItaly.push( italy[i] - prevItaly )
        prevItaly = italy[i];
        forBrowser.deathsDailySA.push( sa[i] - prevSA )
        prevSA = sa[i];
      }
      resolve();
    });
    
    rl.on( 'error', error => {
      reject( error );
    });
  });
}

function compileRecovered() {
  return new Promise(( resolve, reject ) => {
    const confStream = fs.createReadStream( recovered );
    const rl = readline.createInterface({ input: confStream });

    let first = true;
    let headings;
    let sums; // USA
    let italy;
    let sa;
    rl.on( 'line', line => {
      if ( first ) {
        // Province/State,Country/Region,Lat,Long,1/22/20,1/2
        headings = line.split( ',' );
        sums = new Array( headings.length );
        italy = new Array( headings.length );
        sa = new Array( headings.length );
        first = false;
      }
      if ( /US/g.test( line ) && !/"/.test( line )) {
        const spline = line.split(',');
        for ( let i = 4; i < headings.length; i++ ) {
          if ( !sums[i] ) sums[i] = 0;
          sums[i] = sums[i] + parseInt( spline[i] );
        }
        forBrowser.recoveredUSA = sums.slice(4);
      }
      if ( /Italy/g.test( line ) ) {
        const spline = line.split(',');
        for ( let i = 4; i < headings.length; i++ ) {
          if ( !italy[i] ) italy[i] = 0;
          italy[i] = italy[i] + parseInt( spline[i] );
        }
        forBrowser.recoveredItaly = italy.slice(4);
      }
      if ( /South Africa/g.test( line ) ) {
        const spline = line.split(',');
        for ( let i = 4; i < headings.length; i++ ) {
          if ( !sa[i] ) sa[i] = 0;
          sa[i] = sa[i] + parseInt( spline[i] );
        }
        forBrowser.recoveredSA = sa.slice(4);
      }
    });

    rl.on( 'close', () => {
      let prevUS = 0;
      let prevItaly = 0;
      let prevSA = 0;
      for ( let i = 4; i < headings.length; i++ ) {
        forBrowser.recoveredDailyUSA.push( sums[i] - prevUS )
        prevUS = sums[i];
        forBrowser.recoveredDailyItaly.push( italy[i] - prevItaly )
        prevItaly = italy[i];
        forBrowser.recoveredDailySA.push( sa[i] - prevSA )
        prevSA = sa[i];
      }
      resolve();
    });
    
    rl.on( 'error', error => {
      reject( error );
    });
  });
}

function writeHtml( dataString ) {
  const html = fs.readFileSync( './play/template.html' , { encoding: 'utf8' });
  const complete = html
                  .replace( '__DATA__', dataString )
                  .replace('__LASTUPDATED__', new Date().toString() );
  
  fs.writeFileSync( './docs/index.html', complete);

}

async function runner() {
  try {
    console.log( 'Processing confirmed...' );
    await compileConfirmed();
    
    console.log( 'Processing deaths...' );
    await compileDeaths();

    console.log( 'Processing recovered...' );
    await compileRecovered();

    console.log( 'Calculating current infections... ');
    forBrowser.labels.forEach(( labels, i ) => {

      const usa = forBrowser.confUSA[ i ] - forBrowser.deathsUSA[ i ] - forBrowser.recoveredUSA[ i ];
      if ( isNaN( usa ) ) return; // missing data
      forBrowser.currentUSA.push( usa );

      const sa = forBrowser.confSA[ i ] - forBrowser.deathsSA[ i ] - forBrowser.recoveredSA[ i ];
      forBrowser.currentSA.push( sa );

      const italy = forBrowser.confItaly[ i ] - forBrowser.deathsItaly[ i ] - forBrowser.recoveredItaly[ i ];
      forBrowser.currentItaly.push( italy );

    });

    console.log( forBrowser );
    const keys = Object.keys( forBrowser );
    keys.forEach( k => {
      console.log( k, forBrowser[ k].length )
    });
    


    writeHtml( JSON.stringify( forBrowser ) );
    
    console.log( 'Done' );
  }
  catch( error ) {
    console.log( 'Error:', error );
  }
}
runner();
