const QRCode = require('qrcode')
const { createCanvas, loadImage } = require('canvas')
const fs = require('fs').promises
const path = require('path')

function toCRC16(str) {
    let crc = 0xffff
    for (let i = 0; i < str.length; i++) {
        crc ^= str.charCodeAt(i) << 8
        for (let j = 0; j < 8; j++) {
            crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1
        }
    }
    return (crc & 0xffff).toString(16).toUpperCase().padStart(4, '0')
}

async function generateEnhancedQR(qrString, orderInfo) {
    try {
        const baseImagePath = path.join(__dirname, 'assets', 'qrbase.png')
        const baseImage = await loadImage(baseImagePath)

        const canvasWidth = baseImage.width
        const canvasHeight = baseImage.height

        const canvas = createCanvas(canvasWidth, canvasHeight)
        const ctx = canvas.getContext('2d')

        ctx.drawImage(baseImage, 0, 0)

        const qrSize = Math.min(canvasWidth, canvasHeight) * 0.65
        const qrCanvas = createCanvas(qrSize, qrSize)
        await QRCode.toCanvas(qrCanvas, qrString, {
            width: qrSize,
            margin: 1,
            color: {
                dark: '#ffffff',
                light: '#000000'
            },
            errorCorrectionLevel: 'M'
        })

        const qrX = (canvasWidth - qrSize) / 2
        const qrY = (canvasHeight - qrSize) / 2

        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)'
        ctx.shadowBlur = 10
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 3

        ctx.fillStyle = '#000000'
        ctx.fillRect(qrX - 8, qrY - 8, qrSize + 16, qrSize + 16)

        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0

        ctx.drawImage(qrCanvas, qrX, qrY)

        const fileName = `qr_enhanced_${orderInfo.orderId}.png`
        const filePath = path.join(__dirname, 'qrcodes', fileName)

        const buffer = canvas.toBuffer('image/png')
        await fs.writeFile(filePath, buffer)

        console.log(`Enhanced QR code generated: ${fileName}`)
        return filePath

    } catch (error) {
        console.error('Error generating enhanced QR:', error)
        return await generateSimpleQR(qrString, orderInfo.orderId)
    }
}

async function generateSimpleQR(qrString, orderId) {
    try {
        const fileName = `qr_simple_${orderId}.png`
        const filePath = path.join(__dirname, 'qrcodes', fileName)

        await QRCode.toFile(filePath, qrString, {
            width: 400,
            margin: 2,
            color: {
                dark: '#ffffff',
                light: '#000000'
            }
        })

        console.log(`Simple QR code generated: ${fileName}`)
        return filePath
    } catch (error) {
        console.error('Error generating simple QR:', error)
        throw error
    }
}

async function createQRISImage(nominal, orderId, customerInfo, qrCodeText) {
    const updatedQris = qrCodeText.slice(0, -4).replace('010211', '010212')
    const tag54 = `54${nominal.toString().length.toString().padStart(2, '0')}${nominal}`
    const i58 = updatedQris.indexOf('5802ID')
    const payload = updatedQris.slice(0, i58) + tag54 + updatedQris.slice(i58)
    const qrString = payload + toCRC16(payload)

    const orderInfo = {
        orderId: orderId,
        amount: parseInt(nominal),
        customerName: customerInfo ? `${customerInfo.first_name}${customerInfo.last_name ? ' ' + customerInfo.last_name : ''}` : 'Customer'
    }

    return await generateEnhancedQR(qrString, orderInfo)
}

async function createQRISFromString(qrString, orderId) {
    try {
        const qrPath = path.join(__dirname, 'qrcodes', `qr_${orderId}.png`);

        await QRCode.toFile(qrPath, qrString, {
            type: 'png',
            quality: 0.92,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF'
            },
            width: 512
        });

        return qrPath;
    } catch (error) {
        console.error('Error creating QR code from string:', error);
        throw error;
    }
}

module.exports = {
    createQRISImage,
    generateEnhancedQR,
    generateSimpleQR,
    createQRISFromString,
    toCRC16
}
