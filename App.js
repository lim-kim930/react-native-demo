/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button
} from 'react-native';

import {
  DynamsoftBarcodeReader,
  DynamsoftCameraView,
  BarcodeResult,
  EnumDBRPresetTemplate,
  Region,
  EnumBarcodeFormat,
  DBRRuntimeSettings
} from 'henry-capture-vision-react-native';

class App extends React.Component {
  state = {
    results: null 
  };

  componentDidMount() {
    (async () => {
        try {
            await DynamsoftBarcodeReader.initLicense("DLS2eyJvcmdhbml6YXRpb25JRCI6IjIwMDAwMSJ9")
        } catch (e) {
            console.log(e)
        }
        this.reader = await DynamsoftBarcodeReader.createInstance();
        await this.reader.updateDBRRuntimeSettings(EnumDBRPresetTemplate.DEFAULT);
        let settings: DBRRuntimeSettings = await this.reader.getDBRRuntimeSettings();
        // Set the expected barcode count to 0 when you are not sure how many barcodes you are scanning.
        // Set the expected barcode count to 1 can maximize the barcode decoding speed.
        settings.expectedBarcodesCount = 0;
        settings.barcodeFormatIds = EnumBarcodeFormat.BF_ONED | EnumBarcodeFormat.BF_QR_CODE;
        await this.reader.updateDBRRuntimeSettings(settings)

        this.reader.addResultListener(async (results: BarcodeResult[]) => {
            if(results.length>0)
                await this.reader.stopScanning();
            this.setState({results: results});
            // console.log(results.length)
        })
    })();
  };

  async componentWillUnmount() {
    await this.reader.stopScanning()
    this.reader.removeResultListener()
  };

  render() {
    let region: Region;
    let barcode_text = "";
    region = {
        regionTop: 30,
        regionLeft: 15,
        regionBottom: 70,
        regionRight: 85,
        regionMeasuredByPercentage: true
    }
    let results: BarcodeResult[] = this.state.results;
    if (results && results.length > 0){
        for (var i=0; i<results.length; i++) {
            barcode_text += results[i].barcodeFormatString+":"+results[i].barcodeText+"\n"
        }
        console.log(barcode_text);
    }
    const showScanner = async ()=> {
        this.setState({results: []});
        await this.reader.startScanning();
    }

    return (
        (results && results.length <= 0)
        ?<DynamsoftCameraView style={{flex: 1,}} ref = {(ref)=>{this.scanner = ref}} scanRegion ={region} overlayVisible={false}></DynamsoftCameraView>
        :<View style={styles.container}>
            <Text style={styles.result}>{results && results.length > 0 ? barcode_text : "Press button to start"}</Text>
            <View style={styles.button}>
                <Button onPress={showScanner} title="Start" />
            </View>
        </View>
    );
  }
};

const styles = StyleSheet.create({
  container: {
      flexDirection: "column",
      justifyContent: "center",
      flex: 1
  },
  result: {
    color: '#ccc',
    fontWeight: 'bold',
    fontSize: 25,
    textAlign: "center",
    marginBottom: 10
  },
  button: {
      color: "blue",
      width:"50%",
      marginLeft: "25%"
  }
});

export default App;
