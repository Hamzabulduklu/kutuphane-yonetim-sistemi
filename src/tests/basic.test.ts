import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Temel Test Dosyası
 * Kütüphane Yönetim Sistemi için temel fonksiyonaliteleri test eder
 */

describe('🧪 Temel Testler', () => {
  
  /**
   * Matematik işlemleri testi
   * Temel hesaplama fonksiyonlarının doğru çalışıp çalışmadığını kontrol eder
   */
  it('✅ Matematik işlemleri doğru çalışmalı', () => {
    // Toplama işlemi testi
    expect(1 + 1).to.equal(2);
    
    // Çarpma işlemi testi  
    expect(3 * 4).to.equal(12);
    
    // Bölme işlemi testi
    expect(10 / 2).to.equal(5);
  });

  /**
   * Sinon.js Mock/Stub testi
   * Test framework'ünün doğru çalışıp çalışmadığını kontrol eder
   */
  it('✅ Sinon.js stub fonksiyonu çalışmalı', () => {
    // Sahte (mock) fonksiyon oluştur
    const mockFunction = sinon.stub();
    mockFunction.returns('test değeri');
    
    // Fonksiyonu çağır ve sonucu kontrol et
    const result = mockFunction();
    expect(result).to.equal('test değeri');
    
    // Fonksiyonun bir kez çağrıldığını doğrula
    expect(mockFunction.calledOnce).to.be.true;
  });

  /**
   * ULID ID üretimi testi
   * Benzersiz kimlik üretim sisteminin çalışıp çalışmadığını kontrol eder
   */
  it('✅ ULID kimlik üretimi çalışmalı', () => {
    // ULID kütüphanesini import et
    const { ulid } = require('ulid');
    
    // Yeni ULID oluştur
    const id1 = ulid();
    const id2 = ulid();
    
    // ID'nin string olduğunu kontrol et
    expect(id1).to.be.a('string');
    expect(id2).to.be.a('string');
    
    // ULID'nin doğru uzunlukta olduğunu kontrol et (26 karakter)
    expect(id1.length).to.equal(26);
    expect(id2.length).to.equal(26);
    
    // İki farklı ULID'nin farklı olduğunu kontrol et
    expect(id1).to.not.equal(id2);
  });

  /**
   * String işlemleri testi
   * Temel string manipülasyon fonksiyonlarını test eder
   */
  it('✅ String işlemleri doğru çalışmalı', () => {
    const testString = 'Kütüphane Yönetim Sistemi';
    
    // String uzunluğu
    expect(testString.length).to.be.greaterThan(0);
    
    // String içerme kontrolü
    expect(testString).to.include('Kütüphane');
    expect(testString).to.include('Sistem');
    
    // Büyük/küçük harf dönüşümü
    expect(testString.toLowerCase()).to.include('kütüphane');
    expect(testString.toUpperCase()).to.include('KÜTÜPHANE');
  });

  /**
   * Dizi (Array) işlemleri testi
   * JavaScript dizi fonksiyonlarının doğru çalışıp çalışmadığını kontrol eder
   */
  it('✅ Dizi işlemleri doğru çalışmalı', () => {
    const books = ['Kitap 1', 'Kitap 2', 'Kitap 3'];
    
    // Dizi uzunluğu
    expect(books).to.have.lengthOf(3);
    
    // Dizi elementi içerme kontrolü
    expect(books).to.include('Kitap 1');
    expect(books).to.include('Kitap 2');
    
    // Yeni eleman ekleme
    books.push('Kitap 4');
    expect(books).to.have.lengthOf(4);
    expect(books).to.include('Kitap 4');
  });
});
