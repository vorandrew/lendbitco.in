'use strict';

angular.module('gulpangular')
  .service('Platform', function (FED, Account, Ripple, _, RB) {

    var self = this;
    this.arr = [];

    this.reloadCb = function () {
      console.log('Reload callback : re-assign me');
    };

    this.getIssuers = function () {
      return _(this.arr)
        .map('i')
        .uniq()
        .value();
    };

    this.addSymbol = function (issuer, symbol) {

      if (_.isObject(issuer)) {
        var opt = issuer;
        issuer = opt.issuer || opt.i;
        symbol = opt.symbol || opt.s;
      }

      if (symbol === 'XRP') {
        return false;
      }

      var obj = {
        i: issuer,
        s: symbol,
        v: 0,
        b: 0,
        a: 0
      };

      if (_.some(self.arr, obj)) {
        return;
      }

      var isBond = RB.isValidSymbol(symbol);

      if (isBond) {
        obj.e = RB.getExpDate(symbol);
      }

      var index = self.arr.push(obj);
      var elm = self.arr[--index];

      if (isBond && _.indexOf(RB.currencies, symbol) === -1) {
        Ripple.watchBidAsk(issuer, symbol, function (err, priceObj) {
          if (err) {
            return console.log('Watch watchBidAsk error:', err);
          }
          _.assign(elm, priceObj);
          console.log('Price:', elm, priceObj);
          self.reloadCb();
        });
      }
    };

    this.updateBalances = function (cb) {
      Ripple.getBalances(function (err, data) {

        _(data)
          .map(function (balObj) {
            self.addSymbol(balObj);
            var elm = self.arr[_.findIndex(self.arr, _.omit(balObj, 'v'))];
            _.assign(elm, balObj);
            console.log('Balance:', balObj);
          });

        if (cb) {
          return cb(null);
        }
      });
    };

    this.getBalances = function () {
      return _(self.arr)
        .filter(function (e) {
          return e.i === FED &&
            e.v !== 0 &&
            _.indexOf(RB.currencies, e.s) > -1;
        }).value();
    };

    this.getBonds = function () {
      return _(self.arr)
        .filter(function (e) {
          return _.indexOf(RB.currencies, e.s) === -1;
        }).value();
    };

    this.getPositions = function () {
      return _(self.arr)
        .filter(function (e) {
          return e.v !== 0 &&
            _.indexOf(RB.currencies, e.s) === -1;
        }).value();
    };

    angular.forEach(RB.currencies, function (e) {
      self.addSymbol(FED, e);
    });

    angular.forEach(Account.bonds, self.addSymbol);
  });
